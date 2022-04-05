import unittest

import docker

from docker_service import DockerService
from request_models.containers import CreateProjectRequestModel, CreateContainerModel


class DockerServiceTests(unittest.TestCase):

    @staticmethod
    def pg_container():
        return CreateContainerModel(name='db',
                                    image='postgres',
                                    tag='11',
                                    RAM='1g',
                                    CMD='postgres',
                                    envs={'POSTGRES_PASSWORD': 'postgres',
                                          'PGDATA': '/var/lib/postgresql/data/pgdata'},
                                    ports={'5432/tcp': 5433},
                                    volumes={'/var/lib/postgresql/data': '8g'},
                                    healthCheck=None,
                                    dependsOn=[])

    def setUp(self) -> None:
        self.client = docker.from_env()

    # def tearDown(self) -> None:
    #     for container in self.client.containers.list(all=True):
    #         if container.status != 'exited':
    #             container.stop(timeout=0)
    #         container.remove()
    #     for volume in self.client.volumes.list():
    #         volume.remove()
    #     for network in self.client.networks.list():
    #         if network.name not in ('bridge', 'host', 'none'):
    #             network.remove()
    #     self.client.close()

    def test_create_project(self):
        service = DockerService()
        request = CreateProjectRequestModel(project='test',
                                            containers=[self.pg_container()])
        container_id = service.create_project(request).containers[0].id
        self.assertIsNotNone(container_id)
        container = self.client.containers.get(container_id)
        attrs = container.attrs
        config = attrs['Config']
        host_config = attrs['HostConfig']
        host_mount = host_config['Mounts'][0]
        network_settings = attrs['NetworkSettings']
        mount_settings = {'Type': 'volume',
                          'Target': '/var/lib/postgresql/data',
                          'VolumeOptions': {
                              'Labels': {'name': 'db', 'project': 'test'},
                              'DriverConfig': {'Name': 'convoy', 'Options': {'size': '8g'}}}}
        container.reload()
        self.assertEqual(container.status, 'running')
        self.assertTrue(
            'POSTGRES_PASSWORD=postgres' in config['Env'] and 'PGDATA=/var/lib/postgresql/data/pgdata' in config['Env'])
        self.assertEqual(config['Image'], 'postgres:11')
        self.assertListEqual(config['Cmd'], 'postgres'.split(' '))
        self.assertDictEqual(config['Labels'], {'name': 'db', 'project': 'test'})
        self.assertEqual(host_config['Memory'], 1073741824)  # 1073741824 bytes = 1gb
        self.assertDictEqual(host_config['PortBindings'], {'5432/tcp': [{'HostIp': '', 'HostPort': '5433'}]})
        self.assertIn('db_test_.var.lib.postgresql.data', host_mount['Source'])
        mount_settings['Source'] = host_mount['Source']
        # self.assertDictEqual(host_mount, mount_settings)
        self.assertTrue('db' in network_settings['Networks']['project_test']['Aliases'])

    # TODO: delete_project, containers_info_for_project,delete_containers_by_names, add_containers_to_project, redeploy_container, container_logs


if __name__ == '__main__':
    unittest.main()

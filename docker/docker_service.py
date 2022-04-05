import time
from datetime import datetime
from enum import Enum
import random
from typing import Mapping, List

import docker
from docker.models.containers import Container
from docker.models.networks import Network
from docker.models.volumes import Volume
from docker.types import Mount, DriverConfig

from request_models.containers import CreateProjectRequestModel, CreateContainerModel, \
    AddContainersRequestModel
from response_models.containers import ContainerResponseModel, ContainersResponseModel


class ACTION(str, Enum):
    STOP = 'stop'
    START = 'start'
    RESTART = 'restart'


class DockerService:
    def __init__(self):
        # TODO: user DockerClient() and config it with given base_url
        # self._client = docker.from_env()
        self._client = docker.DockerClient(base_url='192.168.1.113:2375')

    @staticmethod
    def _fill_startup_order_list(container_by_name: Mapping[str, CreateContainerModel]) -> List[str]:
        order = []
        for container in container_by_name.values():
            DockerService.__fill_startup_order_list(container, container_by_name, order)
        return order

    @staticmethod
    def __fill_startup_order_list(container: CreateContainerModel,
                                  container_by_name: Mapping[str, CreateContainerModel],
                                  order: List[str]) -> None:
        if container.name not in order:
            if len(container.dependsOn) > 0:
                for i in container.dependsOn:
                    if i not in order:
                        DockerService.__fill_startup_order_list(container_by_name[i], container_by_name, order)
            else:
                order.append(container.name)
                return
            if all(i in order for i in container.dependsOn):
                order.append(container.name)

    @staticmethod
    def _build_network_name(project_id: int) -> str:
        return 'project_' + str(project_id)

    @staticmethod
    def _build_volume_name(container_name: str,
                           project_id: int,
                           path: str) -> str:
        return container_name + '_' + str(project_id) + '_' + path.replace('/', '.') + '_' \
               + str(random.randint(0, 1000))

    @staticmethod
    def _build_mounts(container: CreateContainerModel, labels: dict) -> List[Mount]:
        mounts = []
        if container.volumes:
            for path, size in container.volumes.items():
                mount = Mount(target=path,
                              source=DockerService._build_volume_name(container.name,
                                                                      labels['project'],
                                                                      path),
                              # driver_config=DriverConfig('convoy', {'size': size}),
                              labels=labels)
                mounts.append(mount)
        return mounts

    @staticmethod
    def _build_health_check(container: CreateContainerModel) -> dict:
        health_check = {}
        if container.healthCheck:
            health_check = {'test': container.healthCheck.CMD,
                            'interval': container.healthCheck.interval,
                            'retries': container.healthCheck.retries,
                            'timeout': container.healthCheck.timeout,
                            'start_period': container.healthCheck.startPeriod}
        return health_check

    def _create_network(self, network_name: str, containers: List[ContainerResponseModel]):
        network = self._client.networks.create(name=network_name)
        for i in containers:
            network.connect(container=i.id, aliases=[i.name])

    def _run_container(self,
                       container: CreateContainerModel,
                       project_id: int) -> Container:
        labels = {'name': container.name,
                  'project': str(project_id)}
        mounts = self._build_mounts(container, labels)
        health_check = self._build_health_check(container)
        image = container.image
        if container.tag:
            image += ':' + container.tag
        return self._client.containers.run(image=image,
                                           command=container.CMD,
                                           environment=container.envs,
                                           mounts=mounts,
                                           ports=container.ports,
                                           labels=labels,
                                           mem_limit=container.RAM,
                                           healthcheck=health_check,
                                           detach=True)

    @staticmethod
    def _is_created(container: Container):
        attempt_count = 0
        container.reload()
        while attempt_count != 10 and container.status not in ('running', 'exited', 'dead'):
            time.sleep(1)
            container.reload()
        if attempt_count == 10:
            raise OSError

    def create_project(self, request: CreateProjectRequestModel) -> ContainersResponseModel:
        container_by_name = {}
        for container in request.containers:
            container_by_name[container.name] = container
        order = self._fill_startup_order_list(container_by_name)
        containers = []
        for name in order:
            container = self._run_container(container_by_name[name],
                                            request.project_id)
            self._is_created(container)
            containers.append(ContainerResponseModel(id=container.id, name=container.labels['name'],
                                                     status=container.status,
                                                     startedAt=container.attrs['State']['StartedAt']))
        self._create_network(network_name=self._build_network_name(request.project_id),
                             containers=containers)
        return ContainersResponseModel(containers=containers)

    # TODO: stop in dependsOn order (?)
    def delete_project(self, project_id: int):
        containers = self._get_containers_for_project(project_id)
        for container in containers:
            if container.status != 'exited':
                container.stop(timeout=0)
            container.reload()
            if container.status == 'exited':
                container.remove(v=True)
        network = self._get_network(project_id)
        network.remove()
        for volume in self._get_volumes_for_project(project_id):
            volume.remove()

    # TODO: More info
    def containers_info_for_project(self, project_id: int) -> ContainersResponseModel:
        containers = []
        for container in self._get_containers_for_project(project_id):
            containers.append(ContainerResponseModel(id=container.id,
                                                     name=container.labels['name'],
                                                     status=container.status,
                                                     startedAt=container.attrs['State']['StartedAt']))
        return ContainersResponseModel(containers=containers)

    def _get_container(self, container_id: str) -> Container:
        return self._client.containers.get(container_id)

    def _get_containers_for_project(self, project_id: int) -> List[Container]:
        filters = {'label': [f'project={project_id}']}
        return self._client.containers.list(all=True, filters=filters)

    def _get_network(self, project_id: int) -> Network:
        return self._client.networks.get(self._build_network_name(project_id))

    def _get_volumes_for_project(self, project_id: int) -> List[Volume]:
        filters = {'label': [f'project={project_id}']}
        return self._client.volumes.list(filters=filters)

    def stop_container(self, container_id: str) -> None:
        self._get_container(container_id).stop(timeout=0)

    def start_container(self, container_id: str) -> None:
        self._get_container(container_id).start()

    def restart_container(self, container_id: str) -> None:
        self._get_container(container_id).restart()

    def delete_containers_by_names(self,
                                   project_id: int,
                                   names: List[str]):
        for container in self._get_containers_for_project(project_id):
            if container.labels['name'] in names:
                container.stop(timeout=0)
                container.remove()
        for volume in self._get_volumes_for_project(project_id):
            if volume.attrs['Labels']['name'] in names:
                volume.remove()

    def add_containers_to_project(self, project_id: int, request: AddContainersRequestModel):
        container_by_name = {}
        for container in request.containers:
            container_by_name[container.name] = container
        order = self._fill_startup_order_list(container_by_name)
        containers = []
        network = self._get_network(project_id)
        for name in order:
            container = self._run_container(container_by_name[name],
                                            project_id)
            self._is_created(container)
            network.connect(container.id)
            containers.append(
                ContainerResponseModel(id=container.id, name=container.labels['name'], status=container.status,
                                       startedAt=container.attrs['State']['StartedAt']))
        return ContainersResponseModel(containers=containers)

    def container_logs(self,
                       container_id: str,
                       tail: int,
                       since: datetime,
                       until: datetime) -> str:
        if tail == 0:
            tail = 'all'
        return self._get_container(container_id).logs(tail=tail,
                                                      since=since,
                                                      until=until).decode('unicode_escape')

    # TODO: store stats over time
    def container_stats(self, container_id: str):
        return self._get_container(container_id).stats(stream=False)

# TODO: container console

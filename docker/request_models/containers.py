from typing import Optional, Mapping, List

from pydantic import BaseModel


class HealthCheckModel(BaseModel):
    CMD: str
    interval: int
    retries: int
    timeout: int
    startPeriod: int


class CreateContainerModel(BaseModel):
    name: str  # = Field(123)
    image: str  # = Field('postgres')
    tag: Optional[str] = None  # = Field('9.6')
    RAM: str  # = Field('1g')
    CMD: Optional[str] = None  # = Field('echo 1')
    envs: Optional[Mapping[str, str]] = None  # = Field({'POSTGRES_PASSWORD': 'postgres'})
    ports: Optional[Mapping[str, int]] = None  # = Field({'5432/tcp': 5432})  # 12345/tcp:12345
    volumes: Optional[Mapping[str, str]] = None  # path - size
    healthCheck: Optional[HealthCheckModel] = None  # tcp:123 / http://my-domain:8080/path
    dependsOn: Optional[List[str]] = []

    def to_create_container_model(self, name: str):
        return CreateContainerModel(name=name,
                                    image=self.image,
                                    tag=self.tag,
                                    RAM=self.RAM,
                                    CMD=self.CMD,
                                    envs=self.envs,
                                    ports=self.ports,
                                    volumes=self.volumes,
                                    healthCheck=self.healthCheck,
                                    dependsOn=self.dependsOn)


class CreateProjectRequestModel(BaseModel):
    project_id: int
    containers: List[CreateContainerModel]


class AddContainersRequestModel(BaseModel):
    containers: List[CreateContainerModel]

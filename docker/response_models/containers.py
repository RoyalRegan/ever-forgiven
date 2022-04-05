from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class ContainerResponseModel(BaseModel):
    id: str
    name: str
    status: Optional[str]
    startedAt: datetime
    healthCheckStatus: Optional[str]


class ContainersResponseModel(BaseModel):
    containers: List[ContainerResponseModel]

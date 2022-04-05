from datetime import datetime, timedelta
from typing import List

from docker.errors import APIError
from fastapi import FastAPI, Query
from starlette.responses import PlainTextResponse

from docker_service import DockerService, ACTION
from request_models.containers import CreateProjectRequestModel, AddContainersRequestModel
from response_models.containers import ContainersResponseModel

app = FastAPI()
service = DockerService()


@app.post("/api/project", response_model=ContainersResponseModel)
def create_project(request: CreateProjectRequestModel) -> ContainersResponseModel:
    return service.create_project(request)


@app.delete("/api/projects/{project_id}")
def delete_project(project_id: int):
    service.delete_project(project_id)


@app.get("/api/projects/{project_id}/containers", response_model=ContainersResponseModel)
def containers_info(project_id: int) -> ContainersResponseModel:
    return service.containers_info_for_project(project_id)


@app.delete("/api/projects/{project_id}/containers")
def delete_containers(project_id: int, names: List[str] = Query(None)):
    service.delete_containers_by_names(project_id, names)


@app.post("/api/projects/{project_id}/containers", response_model=ContainersResponseModel)
def add_containers(project_id: int, request: AddContainersRequestModel):
    return service.add_containers_to_project(project_id, request)


@app.get("/api/containers/{container_id}/logs")
def container_logs(container_id: str, tail: int = 0, since: datetime = datetime.now() - timedelta(1),
                   until: datetime = datetime.now()) -> str:
    return service.container_logs(container_id, tail, since, until)


@app.get("/api/containers/{container_id}/stats")
def container_stats(container_id: str):
    return service.container_stats(container_id)


@app.put("/api/containers/{container_id}/state")
def update_container_state(container_id: str, action: ACTION) -> None:
    if action == ACTION.STOP:
        service.stop_container(container_id)
    elif action == ACTION.START:
        service.start_container(container_id)
    elif action == ACTION.RESTART:
        service.restart_container(container_id)


@app.exception_handler(APIError)
def validation_exception_handler(request, exc):
    return PlainTextResponse(str(exc), status_code=500)

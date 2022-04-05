package com.jaju.diplom.application.docker.model

data class DockerContainersModel(
    val containers: List<DockerContainerModel>
)

data class DockerContainerModel(
    val id: String,
    val name: String,
    val status: String? = null,
    val startedAt: String? = null,
    val healthCheckStatus: String? = null
)
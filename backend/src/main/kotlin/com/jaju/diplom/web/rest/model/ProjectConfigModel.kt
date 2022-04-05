package com.jaju.diplom.web.rest.model

data class ProjectConfigModel(
    val name: String,
    val containers: List<ContainerConfigModel>,
    val projectId: Long,
    val version: Int
)

package com.jaju.diplom.domain.model

data class ProjectConfig(
    val name: String,
    val containers: List<ContainerConfig>,
    val projectId: Long,
    val version: Int
)

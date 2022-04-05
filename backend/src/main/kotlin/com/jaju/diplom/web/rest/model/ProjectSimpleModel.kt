package com.jaju.diplom.web.rest.model

data class ProjectSimpleModel(
    val name: String,
    val containersCount: Int,
    val configs: List<ProjectConfigModel>
)

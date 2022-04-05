package com.jaju.diplom.domain.model

data class Project(
    var id: Long,
    var name: String,
    var containers: List<Container>,
    var configs: List<ProjectConfig>
)
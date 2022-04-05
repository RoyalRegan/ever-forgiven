package com.jaju.diplom.application.docker.request

import com.fasterxml.jackson.annotation.JsonProperty

data class CreateProjectRequest(
    @JsonProperty("project_id")
    val projectId: String,
    val containers: List<CreateContainerConfig>
)

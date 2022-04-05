package com.jaju.diplom.web.rest.request

import com.fasterxml.jackson.annotation.JsonProperty
import com.jaju.diplom.persistence.project.HealthCheckDocument

data class CreateProjectRequest(val name: String, val containers: List<CreateContainerConfig>)

data class CreateContainerConfig(
    val name: String,
    val image: String,
    val tag: String = "latest",
    @JsonProperty("CMD")
    val cmd: String?,
    @JsonProperty("RAM")
    val ram: String,
    val volumes: Map<String, String>?,
    val envs: Map<String, String>?,
    val ports: Map<String, Int>?,
    val healthCheck: HealthCheckDocument?,
    val dependentOn: List<String>?
)

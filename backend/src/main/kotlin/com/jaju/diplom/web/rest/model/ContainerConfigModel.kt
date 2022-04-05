package com.jaju.diplom.web.rest.model

import com.fasterxml.jackson.annotation.JsonProperty

data class ContainerConfigModel(
    val name: String,
    val image: String,
    val tag: String,
    @JsonProperty("CMD")
    val cmd: String?,
    @JsonProperty("RAM")
    val ram: String,
    val envs: Map<String, String>?,
    val volumes: Map<String, String>?,
    val ports: Map<String, Int>?,
    val healthCheck: HealthCheckModel?,
    val dependentOn: List<String>?
)

data class HealthCheckModel(
    val cmd: String,
    val interval: Int,
    val retries: Int,
    val timeout: Int,
    val startPeriod: Int
)

package com.jaju.diplom.domain.model

data class ContainerConfig(
    val name: String,
    val image: String,
    val tag: String,
    val cmd: String?,
    val ram: String,
    val envs: Map<String, String>?,
    val volumes: Map<String, String>?,
    val ports: Map<String, Int>?,
    val healthCheck: HealthCheck?,
    val dependentOn: List<String>?
)

data class HealthCheck(
    val cmd: String,
    val interval: Int,
    val retries: Int,
    val timeout: Int,
    val startPeriod: Int
)

package com.jaju.diplom.persistence.project

import java.io.Serializable

data class ContainerConfigDocument(
    val name: String,
    val image: String,
    val tag: String,
    val cmd: String?,
    val ram: String,
    val envs: Map<String, String>?,
    val volumes: Map<String, String>?,
    val ports: Map<String, Int>?,
    val healthCheck: HealthCheckDocument?,
    val dependentOn: List<String>?
) : Serializable

data class HealthCheckDocument(
    val cmd: String,
    val interval: Int,
    val retries: Int,
    val timeout: Int,
    val startPeriod: Int
) : Serializable
package com.jaju.diplom.application.docker

import com.jaju.diplom.application.docker.model.DockerContainerModel
import com.jaju.diplom.application.docker.model.DockerContainersModel
import com.jaju.diplom.application.docker.request.AddContainersRequest
import com.jaju.diplom.application.docker.request.CreateContainerConfig
import com.jaju.diplom.application.docker.request.CreateProjectRequest
import com.jaju.diplom.domain.model.ContainerConfig
import com.jaju.diplom.domain.model.HealthCheck
import com.jaju.diplom.domain.model.Project
import com.jaju.diplom.persistence.ContainerEntity
import com.jaju.diplom.persistence.ContainerRepository
import com.jaju.diplom.persistence.project.ContainerConfigDocument
import com.jaju.diplom.persistence.project.HealthCheckDocument
import com.jaju.diplom.domain.model.ContainerState
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.client.RestTemplate

@Service
class DockerService(
    private val restTemplate: RestTemplate,
    private val containerRepository: ContainerRepository,
) {
    companion object {
        const val DOCKER_SERVICE_URL = "http://localhost:8000/api"
    }

    @Transactional
    fun runProject(project: Project) {
        val request = CreateProjectRequest(
            projectId = project.id.toString(),
            containers = project.getActualConfig()
                .containers
                .map { it.toModel() }
        )
        val runningContainers =
            restTemplate.postForObject(
                "$DOCKER_SERVICE_URL/project",
                request,
                DockerContainersModel::class.java
            )!!.containers
        val storedContainersByName = containerRepository.findByProjectId(project.id)
            .groupBy { it.name }
            .mapValues { it.value[0] }
        runningContainers.filter { storedContainersByName.containsKey(it.name) }
            .forEach { storedContainersByName[it.name]!!.uuid = it.id }
        containerRepository.saveAll(storedContainersByName.values)
    }

    @Transactional
    fun addContainers(projectId: Long, containers: List<ContainerConfigDocument>) {
        val request = AddContainersRequest(containers.map { it.toModel() })
        val runningContainers =
            restTemplate.postForObject(
                "$DOCKER_SERVICE_URL/projects/${projectId}/containers",
                request,
                DockerContainersModel::class.java
            )!!.containers
        val containersEntity = runningContainers.map { it.toEntity(projectId) }
        containerRepository.saveAll(containersEntity)
    }

    @Transactional
    fun deleteContainers(projectId: Long, containerNames: List<String>) {
        restTemplate.delete(
            "$DOCKER_SERVICE_URL/projects/${projectId}/containers?names=${
                containerNames.joinToString(
                    separator = "&"
                )
            }"
        )
        containerRepository.deleteByProjectIdAndNameIn(projectId, containerNames)
    }

    @Transactional
    fun deleteProject(projectId: Long) {
        restTemplate.delete("$DOCKER_SERVICE_URL/projects/${projectId}")
    }

    fun getContainersByProject(project: Project): List<DockerContainerModel> {
        val startedContainers = getContainersState(project.id).groupBy { it.name } as MutableMap
        project.containers.forEach {
            startedContainers.putIfAbsent(
                it.name,
                listOf(DockerContainerModel(id = "nine", name = it.name))
            )
        }
        return startedContainers.values.flatten()
    }

    fun getContainersState(projectId: Long): List<DockerContainerModel> {
        return restTemplate.getForObject(
            "$DOCKER_SERVICE_URL/projects/$projectId/containers",
            DockerContainersModel::class.java
        )!!.containers
    }

    fun changeContainerState(state: ContainerState, containerId: String) {
        restTemplate.put(
            "$DOCKER_SERVICE_URL/containers/${containerId}/state?action=${state.toString().toLowerCase()}",
            null
        )
    }

    fun containerStats(containerId: String): Map<*, *> {
        return restTemplate.getForEntity(
            "$DOCKER_SERVICE_URL/containers/${containerId}/stats",
            Map::class.java
        ).body!!
    }

    fun containerLogs(containerId: String, tail: Int?, since: String?, until: String?): String {
        val urlParams = mapOf("tail" to tail, "since" to since, "until" to until)
        return restTemplate.getForObject(
            "$DOCKER_SERVICE_URL/containers/${containerId}/logs?${
                urlParams.entries.filter { it.value != null }.joinToString(separator = "&") { it.key + "=" + it.value }
            }",
            String::class.java,
        )!!
    }

    private fun DockerContainerModel.toEntity(projectId: Long) = ContainerEntity(
        projectId = projectId,
        name = name,
        uuid = id
    )

    private fun ContainerConfigDocument.toModel() = CreateContainerConfig(
        name = name,
        image = image,
        tag = tag,
        cmd = cmd,
        ram = ram,
        envs = envs,
        volumes = volumes,
        ports = ports,
        healthCheck = healthCheck,
        dependentOn = dependentOn
    )

    private fun HealthCheck.toDocument() = HealthCheckDocument(
        cmd = cmd,
        interval = interval,
        retries = retries,
        timeout = timeout,
        startPeriod = startPeriod
    )

    private fun ContainerConfig.toModel() = CreateContainerConfig(
        name = name,
        image = image,
        tag = tag,
        cmd = cmd,
        ram = ram,
        envs = envs,
        volumes = volumes,
        ports = ports,
        healthCheck = healthCheck?.toDocument(),
        dependentOn = dependentOn
    )

    private fun Project.getActualConfig() = configs.maxByOrNull { it.version } ?: throw IllegalStateException()
}

package com.jaju.diplom.application

import com.jaju.diplom.application.docker.DockerService
import com.jaju.diplom.domain.model.Container
import com.jaju.diplom.domain.model.ContainerConfig
import com.jaju.diplom.domain.model.HealthCheck
import com.jaju.diplom.domain.model.Project
import com.jaju.diplom.domain.model.ProjectConfig
import com.jaju.diplom.loggedUserId
import com.jaju.diplom.persistence.ContainerEntity
import com.jaju.diplom.persistence.ContainerRepository
import com.jaju.diplom.persistence.project.ProjectConfigEntity
import com.jaju.diplom.persistence.project.ProjectConfigRepository
import com.jaju.diplom.persistence.project.ProjectEntity
import com.jaju.diplom.persistence.project.ProjectRepository
import com.jaju.diplom.persistence.project.ContainerConfigDocument
import com.jaju.diplom.persistence.project.HealthCheckDocument
import com.jaju.diplom.persistence.project.ProjectConfigDocument
import com.jaju.diplom.web.rest.request.CreateContainerConfig
import com.jaju.diplom.web.rest.request.CreateProjectRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.lang.IllegalStateException

@Service
class ProjectService(
    private val projectRepository: ProjectRepository,
    private val containerRepository: ContainerRepository,
    private val projectConfigRepository: ProjectConfigRepository,
    private val dockerService: DockerService
) {

    @Transactional
    fun createProject(request: CreateProjectRequest): Long {
        val projectId = projectRepository.save(
            ProjectEntity(
                userId = loggedUserId(),
                name = request.name
            )
        ).id!!
        containerRepository.saveAll(request.containers.map {
            ContainerEntity(
                name = it.name,
                projectId = projectId
            )
        })
        projectConfigRepository.save(
            ProjectConfigEntity(
                projectId = projectId,
                version = 0,
                config = request.toProjectConfig()
            )
        )
        return projectId
    }

    @Transactional
    fun deleteProject(projectName: String) {
        val projectEntity =
            projectRepository.findByUserIdAndName(loggedUserId(), projectName) ?: throw IllegalStateException()
        dockerService.deleteProject(projectEntity.id!!)
        projectRepository.deleteById(projectEntity.id!!)
    }

    @Transactional
    fun updateProject(request: CreateProjectRequest, projectName: String) {
        val projectEntity =
            projectRepository.findByUserIdAndName(loggedUserId(), projectName) ?: throw IllegalStateException()
        val newConfig = request.toProjectConfig()
        val oldConfigEntity = projectConfigRepository.findByProjectIdAndMaxVersion(projectEntity.id!!)
        val oldConfig = oldConfigEntity.config

        if (oldConfig.name != newConfig.name) {
            projectEntity.name = newConfig.name
        }

        val newContainersConfigByName = newConfig.containers.groupBy { it.name }.mapValues { it.value[0] }
        val oldContainersConfigByName = oldConfig.containers.groupBy { it.name }.mapValues { it.value[0] }
        val notChangedContainers = newContainersConfigByName.filter { oldContainersConfigByName.containsKey(it.key) }
            .filter { oldContainersConfigByName[it.key].hashCode() == it.value.hashCode() }
            .map { it.key }
        val stopContainers = oldContainersConfigByName.filter { it.key !in notChangedContainers }
            .map { it.key }
        val runContainers = newContainersConfigByName.filter { it.key !in notChangedContainers }
            .map { it.value }
        if (stopContainers.isNotEmpty()) {
            dockerService.deleteContainers(projectEntity.id!!, stopContainers)
        }
        if (runContainers.isNotEmpty()) {
            dockerService.addContainers(projectEntity.id!!, runContainers)
        }
        if (stopContainers.isNotEmpty() || runContainers.isNotEmpty()) {
            projectConfigRepository.save(
                ProjectConfigEntity(
                    projectId = projectEntity.id!!,
                    version = oldConfigEntity.version + 1,
                    config = newConfig
                )
            )
        }
    }

    fun getUserProjects(): List<Project> {
        return projectRepository.findByUserId(loggedUserId())
            .map { it.toDomain() }
    }

    fun getProjectForUserByName(name: String): Project {
        return projectRepository.findByUserIdAndName(loggedUserId(), name)
            ?.toDomain()
            ?: throw IllegalStateException("project not found")
    }

    private fun CreateContainerConfig.toDocument() = ContainerConfigDocument(
        name = name,
        image = image,
        tag = tag,
        cmd = cmd,
        ram = ram,
        volumes = volumes,
        envs = envs,
        ports = ports,
        healthCheck = healthCheck,
        dependentOn = dependentOn
    )

    private fun CreateProjectRequest.toProjectConfig(): ProjectConfigDocument =
        ProjectConfigDocument(
            name = name,
            containers = containers.map { it.toDocument() }
        )

    private fun ContainerEntity.toDomain() = Container(name = name, projectId = projectId, uuid = uuid)

    private fun HealthCheckDocument.toDomain() =
        HealthCheck(cmd = cmd, interval = interval, retries = retries, timeout = timeout, startPeriod = startPeriod)

    private fun ContainerConfigDocument.toDomain() = ContainerConfig(
        name = name,
        image = image,
        tag = tag,
        cmd = cmd,
        ram = ram,
        envs = envs,
        volumes = volumes,
        ports = ports,
        healthCheck = healthCheck?.toDomain(),
        dependentOn = dependentOn
    )

    private fun ProjectConfigEntity.toDomain() =
        ProjectConfig(
            name = config.name,
            containers = config.containers.map { it.toDomain() },
            projectId = projectId,
            version = version
        )

    private fun ProjectEntity.toDomain() =
        Project(id = id!!,
            name = name,
            containers = containers.map { it.toDomain() },
            configs = configs.map { it.toDomain() }
        )
}
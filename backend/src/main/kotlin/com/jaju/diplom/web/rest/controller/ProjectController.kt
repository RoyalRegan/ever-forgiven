package com.jaju.diplom.web.rest.controller

import com.jaju.diplom.application.ProjectService
import com.jaju.diplom.application.docker.DockerService
import com.jaju.diplom.domain.model.ContainerConfig
import com.jaju.diplom.domain.model.HealthCheck
import com.jaju.diplom.domain.model.Project
import com.jaju.diplom.domain.model.ProjectConfig
import com.jaju.diplom.web.rest.model.ContainerConfigModel
import com.jaju.diplom.web.rest.model.ContainerModel
import com.jaju.diplom.web.rest.model.HealthCheckModel
import com.jaju.diplom.web.rest.model.ProjectConfigModel
import com.jaju.diplom.web.rest.model.ProjectSimpleModel
import com.jaju.diplom.web.rest.request.CreateProjectRequest
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/projects")
class ProjectController(private val projectService: ProjectService, private val dockerService: DockerService) {

    @GetMapping("/{projectName}")
    @Transactional(readOnly = true)
    fun getProject(@PathVariable projectName: String) =
        projectService.getProjectForUserByName(projectName).let {
            ProjectSimpleModel(
                name = it.name,
                containersCount = it.containers.size,
                configs = it.configs.map { projectConfig -> projectConfig.toModel() }
            )
        }


    @PostMapping
    fun createProject(@RequestBody project: CreateProjectRequest) {
        projectService.createProject(project)
    }

    @PutMapping("/{projectName}")
    fun updateProject(@RequestBody project: CreateProjectRequest, @PathVariable projectName: String) {
        projectService.updateProject(project, projectName)
    }

    @DeleteMapping("/{projectName}")
    fun deleteProject(@PathVariable projectName: String) {
        projectService.deleteProject(projectName)
    }

    @GetMapping
    @Transactional(readOnly = true)
    fun getProjects() = projectService.getUserProjects()
        .map {
            it.toModel()
        }


    @PostMapping("/{projectName}/start")
    @Transactional(readOnly = true)
    fun runProject(@PathVariable projectName: String) {
        dockerService.runProject(projectService.getProjectForUserByName(projectName))
    }

    @GetMapping("/{projectName}/containers")
    @Transactional(readOnly = true)
    fun getContainersByProjectId(@PathVariable projectName: String) =
        dockerService.getContainersByProject(projectService.getProjectForUserByName(projectName))
            .map { ContainerModel(it.name, it.status) }


    private fun HealthCheck.toModel() = HealthCheckModel(
        cmd = cmd,
        interval = interval,
        retries = retries,
        timeout = timeout,
        startPeriod = startPeriod
    )

    private fun ContainerConfig.toModel() = ContainerConfigModel(
        name = name,
        image = image,
        tag = tag,
        cmd = cmd,
        ram = ram,
        envs = envs,
        volumes = volumes,
        ports = ports,
        healthCheck = healthCheck?.toModel(),
        dependentOn = dependentOn
    )

    private fun ProjectConfig.toModel() =
        ProjectConfigModel(
            name = name,
            projectId = projectId,
            version = version,
            containers = containers.map { it.toModel() })

    private fun Project.toModel() = ProjectSimpleModel(
        name = name,
        containersCount = containers.size,
        configs = configs.map { it.toModel() }
    )
}
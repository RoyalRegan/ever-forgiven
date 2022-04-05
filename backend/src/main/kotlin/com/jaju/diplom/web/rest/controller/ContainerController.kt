package com.jaju.diplom.web.rest.controller

import com.jaju.diplom.application.ProjectService
import com.jaju.diplom.application.docker.DockerService
import com.jaju.diplom.domain.model.ContainerState
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.lang.IllegalStateException

@RestController
@RequestMapping("/api/project/{projectName}")
class ContainerController(
    private val dockerService: DockerService,
    private val projectService: ProjectService
) {
    @PutMapping("/{containerName}")
    @Transactional(readOnly = true)
    fun changeContainerState(
        @PathVariable projectName: String,
        @PathVariable containerName: String,
        @RequestParam state: ContainerState
    ) {
        dockerService.changeContainerState(state, getContainerUuid(projectName, containerName))
    }

    @GetMapping("/{containerName}/stats")
    @Transactional(readOnly = true)
    fun getContainerStats(
        @PathVariable projectName: String,
        @PathVariable containerName: String,
    ): Map<*, *> = dockerService.containerStats(getContainerUuid(projectName, containerName))


    @GetMapping("/{containerName}/logs")
    @Transactional(readOnly = true)
    fun getContainerLogs(
        @PathVariable projectName: String,
        @PathVariable containerName: String,
        @RequestParam tail: Int? = null,
        @RequestParam since: String? = null,
        @RequestParam until: String? = null
    ): String = dockerService.containerLogs(getContainerUuid(projectName, containerName), tail, since, until)
        .replace("\\n", "\n")


    private fun getContainerUuid(projectName: String, containerName: String): String {
        val projectEntity = projectService.getProjectForUserByName(projectName)
        return projectEntity.containers
            .firstOrNull { it.name == containerName }?.uuid
            ?: throw IllegalStateException("")
    }
}
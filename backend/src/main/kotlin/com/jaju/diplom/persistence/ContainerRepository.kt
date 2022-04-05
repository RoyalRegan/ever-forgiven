package com.jaju.diplom.persistence

import org.springframework.data.jpa.repository.JpaRepository

interface ContainerRepository : JpaRepository<ContainerEntity, Long> {
    fun findByProjectId(projectId: Long): List<ContainerEntity>

    fun deleteByProjectIdAndNameIn(projectId: Long, names: List<String>)
}
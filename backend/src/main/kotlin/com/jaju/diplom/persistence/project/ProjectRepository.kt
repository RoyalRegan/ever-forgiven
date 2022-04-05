package com.jaju.diplom.persistence.project

import org.springframework.data.jpa.repository.JpaRepository

interface ProjectRepository : JpaRepository<ProjectEntity, Long> {
    fun findByUserId(userId: Long): List<ProjectEntity>
    fun findByUserIdAndName(userId: Long, name: String): ProjectEntity?
}
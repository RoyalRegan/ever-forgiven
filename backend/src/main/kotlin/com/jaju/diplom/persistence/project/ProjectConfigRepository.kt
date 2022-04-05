package com.jaju.diplom.persistence.project

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface ProjectConfigRepository : JpaRepository<ProjectConfigEntity, Long> {
    @Query(
        "select p from ProjectConfigEntity p where p.projectId = :projectId " +
                "and p.version = (select max(i.version) from ProjectConfigEntity i where i.projectId = :projectId)"
    )
    fun findByProjectIdAndMaxVersion(projectId: Long): ProjectConfigEntity
}
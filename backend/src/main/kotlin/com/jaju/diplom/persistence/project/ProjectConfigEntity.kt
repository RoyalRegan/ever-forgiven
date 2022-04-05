package com.jaju.diplom.persistence.project

import com.vladmihalcea.hibernate.type.json.JsonBinaryType
import org.hibernate.annotations.Type
import org.hibernate.annotations.TypeDef
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.Table

@Entity
@Table(name = "project_config")
@TypeDef(name = "jsonb", typeClass = JsonBinaryType::class)
class ProjectConfigEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(nullable = false, updatable = false)
    val projectId: Long,

    @Column(nullable = false, updatable = false)
    val version: Int,

    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    val config: ProjectConfigDocument

) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as ProjectConfigEntity

        if (id != other.id) return false
        if (projectId != other.projectId) return false
        if (version != other.version) return false
        if (config != other.config) return false

        return true
    }

    override fun hashCode(): Int {
        var result = id?.hashCode() ?: 0
        result = 31 * result + projectId.hashCode()
        result = 31 * result + version
        result = 31 * result + config.hashCode()
        return result
    }
}
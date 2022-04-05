package com.jaju.diplom.persistence.project

import com.jaju.diplom.persistence.ContainerEntity
import javax.persistence.CascadeType
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.OneToMany
import javax.persistence.Table
import javax.persistence.UniqueConstraint

@Entity
@Table(
    name = "project",
    uniqueConstraints = [UniqueConstraint(name = "user_id_name_uniq", columnNames = ["userId", "name"])]
)
class ProjectEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(nullable = false, updatable = false)
    val userId: Long,

    @Column(nullable = false)
    var name: String,

    @OneToMany(
        mappedBy = "projectId", fetch = FetchType.LAZY,
        cascade = [CascadeType.REMOVE]
    )
    var containers: Set<ContainerEntity> = emptySet(),

    @OneToMany(
        mappedBy = "projectId", fetch = FetchType.LAZY,
        cascade = [CascadeType.REMOVE]
    )
    var configs: Set<ProjectConfigEntity> = emptySet()

) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as ProjectEntity

        if (id != other.id) return false
        if (userId != other.userId) return false
        if (name != other.name) return false
        if (containers != other.containers) return false
        if (configs != other.configs) return false

        return true
    }

    override fun hashCode(): Int {
        var result = id?.hashCode() ?: 0
        result = 31 * result + userId.hashCode()
        result = 31 * result + name.hashCode()
        result = 31 * result + containers.hashCode()
        result = 31 * result + configs.hashCode()
        return result
    }
}
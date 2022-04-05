package com.jaju.diplom.persistence

import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.Table
import javax.persistence.UniqueConstraint

@Entity
@Table(
    name = "container",
    //uniqueConstraints = [UniqueConstraint(name = "project_id_name_uniq", columnNames = ["name", "projectId"])]
)
class ContainerEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(nullable = false)
    var name: String,

    @Column(nullable = false)
    val projectId: Long,

    @Column
    var uuid: String? = null

) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as ContainerEntity

        if (id != other.id) return false
        if (name != other.name) return false
        if (projectId != other.projectId) return false
        if (uuid != other.uuid) return false

        return true
    }

    override fun hashCode(): Int {
        var result = id?.hashCode() ?: 0
        result = 31 * result + name.hashCode()
        result = 31 * result + projectId.hashCode()
        result = 31 * result + (uuid?.hashCode() ?: 0)
        return result
    }
}
package com.jaju.diplom.persistence

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UserRepository : JpaRepository<UserEntity, Long> {

    fun findByUsername(username: String): UserEntity?
}
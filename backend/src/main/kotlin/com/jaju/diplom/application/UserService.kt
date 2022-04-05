package com.jaju.diplom.application

import com.jaju.diplom.domain.model.User
import com.jaju.diplom.persistence.UserEntity
import com.jaju.diplom.persistence.UserRepository
import com.jaju.diplom.unwrap
import com.jaju.diplom.web.rest.request.UserRegisterRequest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service

@Service
class UserService(
    @Autowired
    private val userRepository: UserRepository,
    @Autowired
    private val bCryptPasswordEncoder: BCryptPasswordEncoder
) {

    fun registerUser(request: UserRegisterRequest) {
        userRepository.save(request.toEntity())
    }

    fun findUserById(id: Long): User = userRepository.findById(id)
        .unwrap()
        ?.toDomain()
        ?: throw UsernameNotFoundException("User with id=$id not found")

    fun findUserByUsername(username: String): User = userRepository.findByUsername(username)
        ?.toDomain()
        ?: throw UsernameNotFoundException("User with username=$username not found")

    private fun UserRegisterRequest.toEntity(): UserEntity = UserEntity(
        username = username!!,
        email = email!!,
        password = bCryptPasswordEncoder.encode(password!!)
    )

    private fun UserEntity.toDomain(): User = User(id = id!!, username = username, password = password, email = email)

}




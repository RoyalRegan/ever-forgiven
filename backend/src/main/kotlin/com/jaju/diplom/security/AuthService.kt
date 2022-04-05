package com.jaju.diplom.security

import com.jaju.diplom.application.UserService
import com.jaju.diplom.security.JwtProvider.TokenType.ACCESS
import com.jaju.diplom.security.JwtProvider.TokenType.REFRESH
import com.jaju.diplom.web.rest.model.TokenModel
import com.jaju.diplom.web.rest.request.UserCredentialsRequest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    @Autowired
    private val jwtProvider: JwtProvider,
    @Autowired
    private val bCryptPasswordEncoder: BCryptPasswordEncoder,
    @Autowired
    private val userService: UserService
) {

    fun generateToken(refreshToken: String): TokenModel {
        val userId = jwtProvider.validateToken(refreshToken, REFRESH)
        return jwtProvider.generateToken(userId, ACCESS)
    }

    fun login(userCredentials: UserCredentialsRequest): TokenModel {
        val userEntity = userService.findUserByUsername(userCredentials.username!!)
        return if (bCryptPasswordEncoder.matches(userCredentials.password!!, userEntity.password)) {
            jwtProvider.generateToken(userEntity.id, REFRESH)
        } else {
            throw BadCredentialsException("Wrong password")
        }
    }
}
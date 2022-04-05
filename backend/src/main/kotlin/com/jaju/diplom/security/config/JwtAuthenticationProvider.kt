package com.jaju.diplom.security.config

import com.jaju.diplom.persistence.UserRepository
import com.jaju.diplom.security.JwtAuthenticationToken
import com.jaju.diplom.security.JwtProvider
import com.jaju.diplom.security.JwtProvider.TokenType.ACCESS
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.core.Authentication
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Component

@Component
class JwtAuthenticationProvider(
    @Autowired
    private val jwtProvider: JwtProvider,
    @Autowired
    private val userRepository: UserRepository
) : AuthenticationProvider {

    override fun authenticate(authentication: Authentication): Authentication {
        val token = authentication.credentials as String
        val userId = jwtProvider.validateToken(token, ACCESS)
        (authentication as JwtAuthenticationToken).principal = userId
        return if (userRepository.existsById(userId)) {
            authentication
        } else {
            throw UsernameNotFoundException("User $userId doesn't found")
        }
    }

    override fun supports(authentication: Class<*>): Boolean {
        return JwtAuthenticationToken::class.java.isAssignableFrom(authentication)
    }
}
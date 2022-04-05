package com.jaju.diplom.security

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.exceptions.JWTVerificationException
import com.jaju.diplom.web.rest.model.TokenModel
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.Date
import javax.annotation.PostConstruct

@Service
class JwtProvider(
    @Value("\${jwt.token.secret}")
    private val secretKey: String,

    @Value("\${jwt.token.expiredTime}")
    private val expiredTime: Long
) {

    enum class TokenType {
        ACCESS,
        REFRESH
    }

    private lateinit var algorithm: Algorithm

    @PostConstruct
    fun init() {
        algorithm = Algorithm.HMAC256(secretKey)
    }

    fun generateToken(userId: Long, type: TokenType): TokenModel {
        val expiredTime = Date.from(Instant.now().plusSeconds(expiredTime))
        val token = JWT.create()
            .withIssuer(userId.toString())
            .withNotBefore(Date.from(Instant.now()))
            .withExpiresAt(expiredTime)
            .withClaim("type", type.name)
            .sign(algorithm)
        return TokenModel(token, expiredTime.time)
    }

    fun validateToken(token: String, type: TokenType): Long {
        val verifier = JWT.require(algorithm)
            .withClaim("type", type.name)
            .build()
        try {
            verifier.verify(token)
        } catch (ex: JWTVerificationException) {
            throw BadCredentialsException(ex.message)
        }
        return JWT.decode(token).issuer.toLong()
    }
}
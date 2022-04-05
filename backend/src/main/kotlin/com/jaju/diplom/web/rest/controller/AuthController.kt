package com.jaju.diplom.web.rest.controller

import com.jaju.diplom.security.AuthService
import com.jaju.diplom.web.rest.model.TokenModel
import com.jaju.diplom.web.rest.request.RefreshTokenRequest
import com.jaju.diplom.web.rest.request.UserCredentialsRequest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import javax.validation.Valid

@RestController
class AuthController(
    @Autowired
    val authService: AuthService
) {

    @PostMapping("/token/access")
    fun generateAccessToken(@Valid @RequestBody refreshTokenRequest: RefreshTokenRequest) =
        authService.generateToken(refreshTokenRequest.refreshToken!!)

    @PostMapping("/login")
    fun login(@Valid @RequestBody userCredentials: UserCredentialsRequest) = authService.login(userCredentials)
}
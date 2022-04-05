package com.jaju.diplom.security

import org.springframework.security.authentication.AbstractAuthenticationToken

class JwtAuthenticationToken(
    private var _principal: Any,
    private val credentials: Any
) : AbstractAuthenticationToken(emptyList()) {

    init {
        isAuthenticated = true
    }

    fun setPrincipal(principal: Any) {
        _principal = principal
    }

    override fun getPrincipal(): Any = _principal

    override fun getCredentials(): Any = credentials
}
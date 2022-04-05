package com.jaju.diplom.security.config

import com.jaju.diplom.security.JwtAuthenticationToken
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.filter.OncePerRequestFilter
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

class JwtAuthFilter(private val authenticationManager: AuthenticationManager) : OncePerRequestFilter() {
    companion object {

        private val logger = LoggerFactory.getLogger(JwtAuthFilter::class.java)
        private const val AUTH_PREFIX = "Bearer "
        private const val AUTH_HEADER = "Authorization"
    }

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val authenticate: Authentication
        try {
            val token = extractToken(request)
            authenticate = authenticationManager.authenticate(JwtAuthenticationToken("", token))
        } catch (ex: AuthenticationException) {
            Companion.logger.error(ex.message)
            response.status = HttpStatus.UNAUTHORIZED.value()
            response.flushBuffer()
            return
        }
        SecurityContextHolder.getContext().authentication = authenticate
        filterChain.doFilter(request, response)
    }

    private fun extractToken(request: HttpServletRequest): String {
        val authHeader =
            request.getHeader(AUTH_HEADER) ?: throw BadCredentialsException("Authentication header missing")
        return if (authHeader.startsWith(AUTH_PREFIX)) {
            authHeader.substring(AUTH_PREFIX.length)
        } else {
            throw BadCredentialsException("Wrong authentication type")
        }
    }
}
package com.jaju.diplom.security.config

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter

@EnableWebSecurity
@Configuration
class ApplicationSecurityConfig(
    @Autowired
    private val jwtAuthenticationProvider: JwtAuthenticationProvider
) : WebSecurityConfigurerAdapter() {

    @Bean
    fun bCryptPasswordEncoder(): BCryptPasswordEncoder = BCryptPasswordEncoder()

    override fun configure(auth: AuthenticationManagerBuilder) {
        auth.authenticationProvider(jwtAuthenticationProvider)
    }

    override fun configure(http: HttpSecurity) {
        http.antMatcher("/api/**")
            .cors().and()
            .csrf().disable()
            .authorizeRequests()
            .anyRequest().authenticated()
            .and()
            .addFilterBefore(JwtAuthFilter(authenticationManager()), UsernamePasswordAuthenticationFilter::class.java)
    }
}
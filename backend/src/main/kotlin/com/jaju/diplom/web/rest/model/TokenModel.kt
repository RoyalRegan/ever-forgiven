package com.jaju.diplom.web.rest.model

data class TokenModel(
    val token: String,
    val expiredAt: Long
)
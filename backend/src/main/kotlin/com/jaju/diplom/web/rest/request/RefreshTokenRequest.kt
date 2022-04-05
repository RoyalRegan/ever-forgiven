package com.jaju.diplom.web.rest.request

import javax.validation.constraints.NotNull

data class RefreshTokenRequest(
    @field:NotNull
    val refreshToken: String?
)
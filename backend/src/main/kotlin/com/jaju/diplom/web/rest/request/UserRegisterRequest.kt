package com.jaju.diplom.web.rest.request

import javax.validation.constraints.NotNull

data class UserRegisterRequest(
    @field:NotNull val username: String?,
    @field:NotNull val password: String?,
    @field:NotNull val email: String?
)
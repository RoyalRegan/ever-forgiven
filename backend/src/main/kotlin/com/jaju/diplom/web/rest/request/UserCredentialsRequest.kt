package com.jaju.diplom.web.rest.request

import javax.validation.constraints.NotNull

data class UserCredentialsRequest(
    @field:NotNull val username: String?,
    @field:NotNull val password: String?
)
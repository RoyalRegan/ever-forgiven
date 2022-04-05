package com.jaju.diplom.web.rest.controller

import com.jaju.diplom.application.UserService
import com.jaju.diplom.domain.model.User
import com.jaju.diplom.loggedUserId
import com.jaju.diplom.web.rest.model.UserModel
import com.jaju.diplom.web.rest.request.UserRegisterRequest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import javax.validation.Valid

@RestController
class UserController(
    @Autowired
    val userService: UserService
) {

    @PostMapping("/register")
    fun registerUser(@Valid @RequestBody request: UserRegisterRequest) = userService.registerUser(request)

    @GetMapping("/api/whoami")
    fun whoami(): UserModel = userService.findUserById(loggedUserId()).toModel()

    private fun User.toModel() = UserModel(
        id = id,
        username = username,
        email = email
    )
}
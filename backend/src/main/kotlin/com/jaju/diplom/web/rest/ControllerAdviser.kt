package com.jaju.diplom.web.rest

import org.springframework.http.HttpStatus
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.bind.annotation.ResponseStatus
import java.lang.IllegalStateException

@ControllerAdvice
class ControllerAdviser {

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException::class)
    @ResponseBody
    fun methodArgumentNotValidExceptionHandler(ex: MethodArgumentNotValidException): ViolationsData {
        val violationsInfo = ex.fieldErrors.map { ViolationInfo(it.field, it.rejectedValue, it.defaultMessage) }
        return ViolationsData("Incorrect data", violationsInfo)
    }

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    @ExceptionHandler(BadCredentialsException::class)
    fun badCredentialsExceptionHandler() {
    }

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    @ExceptionHandler(UsernameNotFoundException::class)
    fun usernameNotFoundExceptionHandler() {
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(IllegalStateException::class)
    @ResponseBody
    fun illegalStateExceptionExceptionHandler(ex: IllegalStateException): Map<String, String> {
        return mapOf("message" to ex.localizedMessage)
    }
}

data class ViolationsData(val message: String, val violations: List<ViolationInfo>)

data class ViolationInfo(val field: String, val value: Any?, val violation: String?)
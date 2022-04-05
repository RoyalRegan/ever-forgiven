package com.jaju.diplom

import org.springframework.security.core.context.SecurityContextHolder
import java.util.Optional

fun <T> Optional<T>.unwrap(): T? = orElse(null)

fun loggedUserId() = SecurityContextHolder.getContext().authentication.principal as Long
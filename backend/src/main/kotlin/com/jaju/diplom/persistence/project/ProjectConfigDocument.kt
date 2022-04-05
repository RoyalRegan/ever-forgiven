package com.jaju.diplom.persistence.project

import java.io.Serializable

data class ProjectConfigDocument(val name: String, val containers: List<ContainerConfigDocument>) : Serializable

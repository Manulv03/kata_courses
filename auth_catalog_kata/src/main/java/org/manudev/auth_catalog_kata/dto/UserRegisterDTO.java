package org.manudev.auth_catalog_kata.dto;

import java.util.Set;

public record UserRegisterDTO (String email, String password, String name, Set<String> roles){}

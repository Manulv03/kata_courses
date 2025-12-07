package org.manudev.auth_catalog_kata.controllers;

import org.manudev.auth_catalog_kata.services.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String token = authService.login(email, password);
        return ResponseEntity.ok(Map.of("token", token, "tokenType", "Bearer"));
    }
}

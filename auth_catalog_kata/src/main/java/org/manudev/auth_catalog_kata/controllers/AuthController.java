package org.manudev.auth_catalog_kata.controllers;

import org.manudev.auth_catalog_kata.dto.UserRegisterDTO;
import org.manudev.auth_catalog_kata.entities.User;
import org.manudev.auth_catalog_kata.services.impl.AuthServiceImpl;
import org.manudev.auth_catalog_kata.services.interfaces.IUserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/auth")
public class AuthController {

    public AuthController(AuthServiceImpl authServiceImpl, IUserService userService) {
        this.authServiceImpl = authServiceImpl;
        this.userService = userService;
    }

    private final AuthServiceImpl authServiceImpl;
    private final IUserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String token = authServiceImpl.login(email, password);
        return ResponseEntity.ok(Map.of("token", token, "tokenType", "Bearer"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRegisterDTO userDto) {
        try {
            User newUser = userService.createUser(userDto);
            return new ResponseEntity<>(newUser, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

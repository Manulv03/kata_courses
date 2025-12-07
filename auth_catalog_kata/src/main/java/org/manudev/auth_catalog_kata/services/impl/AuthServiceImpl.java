package org.manudev.auth_catalog_kata.services.impl;

import org.manudev.auth_catalog_kata.entities.Role;
import org.manudev.auth_catalog_kata.entities.User;
import org.manudev.auth_catalog_kata.repository.IUsersRepository;
import org.manudev.auth_catalog_kata.security.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;

@Service
public class AuthServiceImpl {

    private final IUsersRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();


    public AuthServiceImpl(IUsersRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    public String login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Credenciales inválidas"));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new IllegalArgumentException("Credenciales inválidas");
        }

        HashMap<String, Object> claims = new HashMap<>();
        claims.put("id", user.getId());
        claims.put("email", user.getEmail());
        claims.put("roles", user.getRoles().stream().map(Role::getName).toArray());

        return jwtUtil.generateToken(user.getId().toString(), claims);
    }
}

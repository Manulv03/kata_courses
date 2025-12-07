package org.manudev.auth_catalog_kata.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class JwtFilter extends OncePerRequestFilter {

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);

        try {
            Jws<Claims> jws = jwtUtil.parseToken(token);
            Claims claims = jws.getBody();

            // extraer roles desde claims (adapta según cómo generes claims)
            Object rolesObj = claims.get("roles");
            List<String> roles = new ArrayList<>();
            if (rolesObj instanceof Collection) {
                roles = ((Collection<?>) rolesObj).stream()
                        .map(Object::toString)
                        .collect(Collectors.toList());
            } else if (rolesObj instanceof Object[]) {
                roles = Arrays.stream((Object[]) rolesObj)
                        .map(Object::toString)
                        .collect(Collectors.toList());
            } else if (rolesObj != null) {
                roles = Collections.singletonList(rolesObj.toString());
            }

            List<SimpleGrantedAuthority> authorities = roles.stream()
                    .map(r -> new SimpleGrantedAuthority("ROLE_" + r.toUpperCase()))
                    .collect(Collectors.toList());

            // subject puede ser id o email según tu implementación
            String subject = claims.getSubject();

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(subject, null, authorities);

            SecurityContextHolder.getContext().setAuthentication(auth);

            filterChain.doFilter(request, response);

        } catch (Exception ex) {
            // Si el header existía pero el token es inválido -> 401
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Token inválido\"}");
        }
    }
}

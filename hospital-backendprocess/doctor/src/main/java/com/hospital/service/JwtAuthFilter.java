package com.hospital.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Value("${app.jwtSecret}")
    private String secretKey;

    private Key resolveSigningKey() {
        byte[] secretBytes;
        try {
            // Prefer Base64 when the secret is encoded.
            secretBytes = Base64.getDecoder().decode(secretKey);
        } catch (IllegalArgumentException ex) {
            // Support plain secrets like "dev-jwt-secret-change-me".
            secretBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        }

        if (secretBytes.length < 64) {
            try {
                // HS512-compatible fallback key derivation.
                MessageDigest sha512 = MessageDigest.getInstance("SHA-512");
                secretBytes = sha512.digest(secretBytes);
            } catch (Exception e) {
                throw new IllegalStateException("Unable to derive JWT signing key", e);
            }
        }

        return Keys.hmacShaKeyFor(secretBytes);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                Key key = resolveSigningKey();

                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(key)
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                String username = claims.getSubject();
                List<String> roles = claims.get("roles", List.class);

                if (username != null && roles != null) {
                    var authorities = roles.stream()
                            .filter(role -> role != null && !role.isBlank())
                            .map(String::trim)
                            .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
                            .map(SimpleGrantedAuthority::new)
                            .toList();

                    SecurityContextHolder.getContext().setAuthentication(
                            new UsernamePasswordAuthenticationToken(username, null, authorities));
                }

            } catch (Exception e) {
                System.out.println("❌ Invalid JWT Token: " + e.getMessage());
            }
        }
        filterChain.doFilter(request, response);
    }
}

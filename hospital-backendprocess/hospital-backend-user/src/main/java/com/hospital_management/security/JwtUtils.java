package com.hospital_management.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import com.hospital_management.service.UserDetailsImpl;

import java.security.Key;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Date;
import java.util.List;
import java.util.Base64;
import java.util.stream.Collectors;

@Component
public class JwtUtils {

    @Value("${app.jwtSecret}")
    private String jwtSecret;

    @Value("${app.jwtExpirationMs}")
    private int jwtExpirationMs;

    // Build an HS512-compatible key from either Base64 or plain-text secret.
    private Key key() {
        byte[] secretBytes;
        try {
            // If secret is Base64-encoded, prefer it.
            secretBytes = Base64.getDecoder().decode(jwtSecret);
        } catch (IllegalArgumentException ex) {
            // Fallback for plain text secrets like "dev-jwt-secret-change-me".
            secretBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        }

        if (secretBytes.length < 64) {
            try {
                // HS512 needs >= 64 bytes. Derive deterministic 64-byte key from secret.
                MessageDigest sha512 = MessageDigest.getInstance("SHA-512");
                secretBytes = sha512.digest(secretBytes);
            } catch (Exception e) {
                throw new IllegalStateException("Unable to derive JWT signing key", e);
            }
        }

        return Keys.hmacShaKeyFor(secretBytes);
    }

    // ✅ Generate token with username, roles, and userId
    public String generateJwtToken(Authentication authentication) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        // Extract roles from UserDetailsImpl
        List<String> roles = userPrincipal.getAuthorities()
                .stream()
                .map(auth -> auth.getAuthority())
                .collect(Collectors.toList());

        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())              // username
                .claim("userId", userPrincipal.getId())               // optional - user ID
                .claim("roles", roles)                                // ✅ include roles
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS512)
                .compact();
    }

    // ✅ Extract username (subject) from JWT
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // ✅ Extract roles if needed (optional helper)
    public List<String> getRolesFromJwtToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.get("roles", List.class);
    }

    // ✅ Validate JWT token
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(authToken);
            return true;
        } catch (MalformedJwtException e) {
            System.err.println("❌ Invalid JWT token: " + e.getMessage());
        } catch (ExpiredJwtException e) {
            System.err.println("⚠️ JWT token expired: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            System.err.println("⚠️ JWT token unsupported: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.err.println("⚠️ JWT claims string empty: " + e.getMessage());
        }
        return false;
    }
}

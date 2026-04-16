package com.hospital.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.hospital.service.JwtAuthFilter;

import org.springframework.security.config.http.SessionCreationPolicy;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configure(http))
            .authorizeHttpRequests(auth -> auth

                // ✅ OPTIONS allow (CORS preflight)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // ✅ PUBLIC ENDPOINTS FIRST (VERY IMPORTANT 🔥)
                .requestMatchers("/", "/health").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/api/doctors/health").permitAll()
                .requestMatchers("/api/doctors/internal/ai-context").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/doctors", "/api/doctors/").permitAll()

                // 🔐 PROTECTED
                .requestMatchers("/api/doctors/add", "/api/doctors/delete/**").hasRole("ADMIN")
                .requestMatchers("/api/doctors/**").hasAnyRole("ADMIN", "USER")

                // 🔒 fallback
                .anyRequest().authenticated()
            )
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
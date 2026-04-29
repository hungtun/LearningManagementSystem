package com.ou.LMS_Spring.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.ou.LMS_Spring.helpers.JwtAuthFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
        http.csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
            // Routes AUTH - No JWT
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/api/enrollments/course/*/students").hasAnyRole("INSTRUCTOR","ADMIN")
            .requestMatchers("/api/system/analytics/instructor").hasAnyRole("INSTRUCTOR","ADMIN")
            .requestMatchers("/api/system/analytics/admin").hasRole("ADMIN")
            .requestMatchers("/api/admin/**",
                                        "/api/enrollments/stats" ).hasRole("ADMIN")
            .anyRequest().authenticated()
        )
        .sessionManagement(sesson-> sesson
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        )
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

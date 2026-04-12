package com.ou.LMS_Spring.modules.users.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ou.LMS_Spring.modules.users.dtos.requests.LoginRequest;
import com.ou.LMS_Spring.modules.users.dtos.requests.RegisterRequest;
import com.ou.LMS_Spring.modules.users.dtos.responses.LoginResponse;
import com.ou.LMS_Spring.modules.users.services.interfaces.IAuthService;
import com.ou.LMS_Spring.resources.SuccessResource;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Validated
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final IAuthService authService;

    @PostMapping("/login")
    public ResponseEntity<SuccessResource<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse body = authService.authenticate(request);
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", body));
    }

    @PostMapping("/register")
    public ResponseEntity<SuccessResource<LoginResponse>> register(@Valid @RequestBody RegisterRequest request) {
        LoginResponse body = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResource<>("CREATED", body));
    }
}
package com.ou.LMS_Spring.modules.users.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ou.LMS_Spring.modules.users.dtos.requests.LoginRequest;
import com.ou.LMS_Spring.modules.users.dtos.responses.LoginResponse;
import com.ou.LMS_Spring.modules.users.services.interfaces.IUserService;
import com.ou.LMS_Spring.resources.ErrorResource;

import jakarta.validation.Valid;


@Validated
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final IUserService userService;

    public AuthController(IUserService userService) {
        this.userService = userService;

    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {

        Object result = userService.authenticate(request);
        if (result instanceof LoginResponse loginResponse) {
            return ResponseEntity.ok(loginResponse);
        }

        if (result instanceof ErrorResource errorResource) {
            return ResponseEntity.unprocessableContent().body(errorResource);
            
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Network Error");
    }


}

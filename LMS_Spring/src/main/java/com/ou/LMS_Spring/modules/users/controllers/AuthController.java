package com.ou.LMS_Spring.modules.users.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ou.LMS_Spring.modules.users.dtos.requests.LoginRequest;
import com.ou.LMS_Spring.modules.users.dtos.responses.LoginResponse;
import com.ou.LMS_Spring.modules.users.services.interfaces.IUserService;


@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final IUserService userService;

    public AuthController(IUserService userService) {
        this.userService = userService;

    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = userService.login(request);



        return ResponseEntity.ok(response);
    }


}

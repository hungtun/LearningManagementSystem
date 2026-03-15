package com.ou.LMS_Spring.modules.users.dtos.responses;

import com.ou.LMS_Spring.modules.users.dtos.UserDto;

import lombok.Data;

@Data
public class RegisterResponse {
    private final String token;
    private final UserDto user;

    public RegisterResponse(String token, UserDto user) {
        this.token = token;
        this.user = user;
    }
}

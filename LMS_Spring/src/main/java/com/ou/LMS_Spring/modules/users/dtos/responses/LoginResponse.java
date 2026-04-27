package com.ou.LMS_Spring.modules.users.dtos.responses;

import com.ou.LMS_Spring.modules.users.dtos.UserDto;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Data
public class LoginResponse {
    private final String token;
    private final UserDto user;
}

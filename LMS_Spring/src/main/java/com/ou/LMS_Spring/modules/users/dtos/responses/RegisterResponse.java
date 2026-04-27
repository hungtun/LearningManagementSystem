package com.ou.LMS_Spring.modules.users.dtos.responses;

import com.ou.LMS_Spring.modules.users.dtos.UserDto;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class RegisterResponse {
    private final String token;
    private final UserDto user;
}

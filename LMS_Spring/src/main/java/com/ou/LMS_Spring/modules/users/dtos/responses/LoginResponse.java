package com.ou.LMS_Spring.modules.users.dtos.responses;

import com.ou.LMS_Spring.modules.users.dtos.UserDto;

public class LoginResponse {
    private final String token;
    private final UserDto user;


    public LoginResponse(String token, UserDto user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public UserDto getUser() {
        return user;
    }

}

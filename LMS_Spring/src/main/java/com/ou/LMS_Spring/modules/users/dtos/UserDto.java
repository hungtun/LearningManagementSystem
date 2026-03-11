package com.ou.LMS_Spring.modules.users.dtos;

public class UserDto {
    private final Long id;
    private final String email;

    public UserDto(Long id, String email) {
        this.id = id;
        this.email = email;
    }

    public Long getId() {
        return id;
    }
    public String getEmail() {
        return email;
    }
}

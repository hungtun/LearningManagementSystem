package com.ou.LMS_Spring.modules.users.dtos;

public class UserDto {
    private final Long id;
    private final String email;
    private final String fullName;

    public UserDto(Long id, String email, String fullName) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;

    }

    public Long getId() {
        return id;
    }
    public String getEmail() {
        return email;
    }
    public String getFullName() {
        return fullName;
    }
}

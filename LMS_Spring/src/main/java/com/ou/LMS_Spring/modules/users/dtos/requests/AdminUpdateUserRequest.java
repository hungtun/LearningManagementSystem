package com.ou.LMS_Spring.modules.users.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminUpdateUserRequest {
    @NotBlank  
    @Size(max = 100)
    private String fullName;
}

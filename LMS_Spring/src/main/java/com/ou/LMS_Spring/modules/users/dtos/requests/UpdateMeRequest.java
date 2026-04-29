package com.ou.LMS_Spring.modules.users.dtos.requests;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateMeRequest {
    @NotBlank
    @Size(max = 100)
    private String fullName;

    @Size(max = 2048)
    private String avatarUrl;
}

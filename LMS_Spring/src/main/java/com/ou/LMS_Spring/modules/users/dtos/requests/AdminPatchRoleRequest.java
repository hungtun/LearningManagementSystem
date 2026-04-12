package com.ou.LMS_Spring.modules.users.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminPatchRoleRequest {
    @NotBlank
    private String roleName;
}

package com.ou.LMS_Spring.modules.users.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BlacklistTokenRequest {
    @NotBlank(message = "Token must not be blank")
    private String token;
}

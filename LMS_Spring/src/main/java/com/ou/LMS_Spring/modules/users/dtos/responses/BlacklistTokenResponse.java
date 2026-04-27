package com.ou.LMS_Spring.modules.users.dtos.responses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
@AllArgsConstructor
public class BlacklistTokenResponse {
    private Long id;
    private Long userId;
    private String message;
    private String token;
}

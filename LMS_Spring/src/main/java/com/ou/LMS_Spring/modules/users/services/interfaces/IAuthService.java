package com.ou.LMS_Spring.modules.users.services.interfaces;

import com.ou.LMS_Spring.modules.users.dtos.requests.LoginRequest;
import com.ou.LMS_Spring.modules.users.dtos.requests.RegisterRequest;
import com.ou.LMS_Spring.modules.users.dtos.responses.LoginResponse;

public interface IAuthService {
    LoginResponse authenticate(LoginRequest request);
    LoginResponse register(RegisterRequest request);
}

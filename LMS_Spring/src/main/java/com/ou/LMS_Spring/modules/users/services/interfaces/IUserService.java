package com.ou.LMS_Spring.modules.users.services.interfaces;

import com.ou.LMS_Spring.modules.users.dtos.requests.LoginRequest;
import com.ou.LMS_Spring.modules.users.dtos.responses.LoginResponse;

public interface IUserService {
    LoginResponse login(LoginRequest request);
    
}

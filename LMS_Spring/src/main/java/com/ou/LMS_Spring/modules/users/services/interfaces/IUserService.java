package com.ou.LMS_Spring.modules.users.services.interfaces;

import com.ou.LMS_Spring.modules.users.dtos.requests.LoginRequest;
import com.ou.LMS_Spring.modules.users.dtos.requests.RegisterRequest;

public interface IUserService {
    Object authenticate(LoginRequest request);
    Object register(RegisterRequest request);
}

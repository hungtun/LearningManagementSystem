package com.ou.LMS_Spring.modules.users.services.impl;

import org.springframework.stereotype.Service;

import com.ou.LMS_Spring.Services.BaseService;
import com.ou.LMS_Spring.modules.users.dtos.UserDto;
import com.ou.LMS_Spring.modules.users.dtos.requests.LoginRequest;
import com.ou.LMS_Spring.modules.users.dtos.responses.LoginResponse;
import com.ou.LMS_Spring.modules.users.services.interfaces.IUserService;

@Service
public class UserService extends BaseService implements IUserService {
    
    @Override
    public LoginResponse login(LoginRequest request) {
        try {
            // String email = request.getEmail();
            // String password = request.getPassword();

           
            String token = "dummy-jwt-token";
            UserDto user = new UserDto(1L, "u1@gmail.com");

                
            

            return new LoginResponse(token, user);
        
            
        } catch (Exception e) {
            throw new RuntimeException("Login failed: " + e.getMessage());
        }
    }
}

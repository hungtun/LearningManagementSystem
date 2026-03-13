package com.ou.LMS_Spring.modules.users.services.impl;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ou.LMS_Spring.Entities.User;
import com.ou.LMS_Spring.Services.BaseService;
import com.ou.LMS_Spring.Services.JwtService;
import com.ou.LMS_Spring.modules.users.dtos.UserDto;
import com.ou.LMS_Spring.modules.users.dtos.requests.LoginRequest;
import com.ou.LMS_Spring.modules.users.dtos.responses.LoginResponse;
import com.ou.LMS_Spring.modules.users.repositories.UserRepository;
import com.ou.LMS_Spring.modules.users.services.interfaces.IUserService;
import com.ou.LMS_Spring.resources.ErrorResource;

@Service
public class UserService extends BaseService implements IUserService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    
    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Object authenticate(LoginRequest request) {
        try {

            User user = userRepository.findByEmail(request.getEmail()).orElseThrow(()-> new
                BadCredentialsException("Email or password is incorrect")
            );

            if(!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())){
                throw new BadCredentialsException("Email or password is incorrect");
            }
           
            UserDto userDto = new UserDto(user.getId(), user.getEmail(), user.getFullName());

            String token = jwtService.generateToken(user.getId(), user.getEmail());

            return new LoginResponse(token, userDto);        
            
        } catch (BadCredentialsException e) {
            logger.error("Authentication error: {}", e.getMessage());

            Map<String, String> errorDetails = new HashMap<>();
            errorDetails.put("message", e.getMessage());

            ErrorResource errorResource = new ErrorResource("Authentication failed", errorDetails);
            return errorResource;
        }
    }
}

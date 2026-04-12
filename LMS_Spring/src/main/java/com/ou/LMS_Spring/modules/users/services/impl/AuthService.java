package com.ou.LMS_Spring.modules.users.services.impl;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ou.LMS_Spring.Entities.User;
import com.ou.LMS_Spring.Services.BaseService;
import com.ou.LMS_Spring.Services.JwtService;
import com.ou.LMS_Spring.helpers.ApiBusinessException;
import com.ou.LMS_Spring.modules.users.dtos.UserDto;
import com.ou.LMS_Spring.modules.users.dtos.requests.LoginRequest;
import com.ou.LMS_Spring.modules.users.dtos.requests.RegisterRequest;
import com.ou.LMS_Spring.modules.users.dtos.responses.LoginResponse;
import com.ou.LMS_Spring.modules.users.repositories.UserRepository;
import com.ou.LMS_Spring.modules.users.services.interfaces.IAuthService;
import com.ou.LMS_Spring.resources.ErrorResource;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService extends BaseService implements IAuthService {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    private static final String CODE = "code";
    private JwtService jwtService;
    private PasswordEncoder passwordEncoder;
    private UserRepository userRepository;

    @Override
    public LoginResponse authenticate(LoginRequest request) {
        try {
            User user = userRepository.findByEmail(request.getEmail()).orElseThrow(
                    () -> new BadCredentialsException("Email or password is incorrect"));
            if (!user.isActive()) {
                throw accountDisabled();
            }
            if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                throw new BadCredentialsException("Email or password is incorrect");
            }
            UserDto userDto = new UserDto(user.getId(), user.getEmail(), user.getFullName());
            String token = jwtService.generateToken(user.getId(), user.getEmail());
            return new LoginResponse(token, userDto);
        } catch (BadCredentialsException e) {
            logger.warn("Authentication failed: {}", e.getMessage());
            throw e;
        }
    }
    @Override
    public LoginResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw emailAlreadyInUse();
        }
        User user = new User();
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
        UserDto userDto = new UserDto(user.getId(), user.getEmail(), user.getFullName());
        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return new LoginResponse(token, userDto);
    }
    private ApiBusinessException accountDisabled() {
        Map<String, String> errors = new HashMap<>();
        errors.put(CODE, "ACCOUNT_DISABLED");
        errors.put("message", "Account is disabled");
        return new ApiBusinessException(HttpStatus.FORBIDDEN,
                new ErrorResource("Authentication failed", errors));
    }
    private ApiBusinessException emailAlreadyInUse() {
        Map<String, String> errors = new HashMap<>();
        errors.put(CODE, "EMAIL_ALREADY_EXISTS");
        errors.put("email", "Email is already in use");
        return new ApiBusinessException(HttpStatus.CONFLICT,
                new ErrorResource("Registration failed", errors));
    }
}

package com.ou.LMS_Spring.modules.users.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ou.LMS_Spring.Entities.User;
import com.ou.LMS_Spring.modules.users.dtos.UserDto;
import com.ou.LMS_Spring.modules.users.repositories.UserRepository;
import com.ou.LMS_Spring.resources.SuccessResource;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserRepository userRepository;

     private static final Logger logger = LoggerFactory.getLogger(UserController.class);


    @GetMapping("/me")
    public ResponseEntity me(){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(()-> new RuntimeException("User not exist"));

        UserDto userDto = UserDto.builder()
            .id(user.getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .build();

        SuccessResource<UserDto> response = new SuccessResource<UserDto>("SUCCESS", userDto);

        return ResponseEntity.ok(response);
    }
}

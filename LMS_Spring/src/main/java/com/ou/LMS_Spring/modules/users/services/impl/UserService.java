package com.ou.LMS_Spring.modules.users.services.impl;


import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ou.LMS_Spring.Entities.User;
import com.ou.LMS_Spring.Services.BaseService;
import com.ou.LMS_Spring.modules.users.dtos.UserDto;
import com.ou.LMS_Spring.modules.users.dtos.requests.UpdateMeRequest;
import com.ou.LMS_Spring.modules.users.repositories.UserRepository;
import com.ou.LMS_Spring.modules.users.services.interfaces.IUserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService extends BaseService implements IUserService {
    private final UserRepository userRepository;

    private User currentUser(){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        return userRepository.findByEmail(email).orElseThrow(()->new IllegalStateException("User not found"));
    }
    @Override
    @Transactional(readOnly = true)
    public UserDto getCurrentUserProfile(){
        User u = currentUser();
        return new UserDto(u.getId(), u.getEmail(), u.getFullName());
    }

    @Override
    @Transactional
    public UserDto updateCurrentUserProfile(UpdateMeRequest request){
        User u = currentUser();
        u.setFullName(request.getFullName().trim());
        userRepository.save(u);
        return new UserDto(u.getId(), u.getEmail(), u.getFullName());
    }


}

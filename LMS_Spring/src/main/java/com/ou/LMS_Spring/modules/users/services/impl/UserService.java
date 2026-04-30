package com.ou.LMS_Spring.modules.users.services.impl;


import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.ou.LMS_Spring.Entities.Role;
import com.ou.LMS_Spring.Entities.User;
import com.ou.LMS_Spring.helpers.exceptions.UserNotFoundException;
import com.ou.LMS_Spring.Services.BaseService;
import com.ou.LMS_Spring.modules.system.services.impl.CloudinaryService;
import com.ou.LMS_Spring.modules.users.dtos.UserDto;
import com.ou.LMS_Spring.modules.users.dtos.requests.UpdateMeRequest;
import com.ou.LMS_Spring.modules.users.repositories.UserRepository;
import com.ou.LMS_Spring.modules.users.services.interfaces.IUserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService extends BaseService implements IUserService {
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    private User currentUser(){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException());
    }

    private List<String> roleNames(User u) {
        return u.getRoles().stream().map(Role::getName).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getCurrentUserProfile(){
        User u = currentUser();
        return new UserDto(u.getId(), u.getEmail(), u.getFullName(), u.getAvatarUrl(), roleNames(u));
    }

    @Override
    @Transactional
    public UserDto updateCurrentUserProfile(UpdateMeRequest request){
        User u = currentUser();
        u.setFullName(request.getFullName().trim());
        String avatarUrl = request.getAvatarUrl();
        if (avatarUrl != null) {
            String normalizedAvatarUrl = avatarUrl.trim();
            u.setAvatarUrl(normalizedAvatarUrl.isEmpty() ? null : normalizedAvatarUrl);
        }
        userRepository.save(u);
        return new UserDto(u.getId(), u.getEmail(), u.getFullName(), u.getAvatarUrl(), roleNames(u));
    }

    @Override
    @Transactional
    public UserDto updateCurrentUserAvatar(MultipartFile file) {
        User u = currentUser();
        String uploadedAvatarUrl = cloudinaryService.uploadAvatar(file);
        u.setAvatarUrl(uploadedAvatarUrl);
        userRepository.save(u);
        return new UserDto(u.getId(), u.getEmail(), u.getFullName(), u.getAvatarUrl(), roleNames(u));
    }


}

package com.ou.LMS_Spring.modules.users.services.impl;

import java.util.Collections;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.ou.LMS_Spring.Entities.User;
import com.ou.LMS_Spring.modules.users.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService{
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException{

        User user = userRepository.findById(Long.valueOf(userId)).orElseThrow(()->new UsernameNotFoundException(" User not exist"));

        return new org.springframework.security.core.userdetails.User(
            user.getEmail(),
            user.getPasswordHash(),
            Collections.emptyList()
        );
    }


}

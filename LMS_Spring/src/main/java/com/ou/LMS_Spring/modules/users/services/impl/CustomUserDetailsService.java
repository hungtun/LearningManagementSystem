package com.ou.LMS_Spring.modules.users.services.impl;

import java.text.Collator;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.ou.LMS_Spring.Entities.Role;
import com.ou.LMS_Spring.Entities.User;
import com.ou.LMS_Spring.modules.users.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService{
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException{

        User user = userRepository.findWithRolesById(Long.valueOf(userId))
                .orElseThrow(() -> new UsernameNotFoundException("User not exist"));

        if(!user.isActive()){
            throw new UsernameNotFoundException("Account is disabled");
        }

        List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
            .map(Role::getName)
            .map(name -> new SimpleGrantedAuthority("ROLE_"+name))
            .collect(Collectors.toList());

        return new org.springframework.security.core.userdetails.User(
            user.getEmail(),
            user.getPasswordHash(),
            authorities
        );
    }


}

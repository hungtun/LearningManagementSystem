package com.ou.LMS_Spring.modules.users.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ou.LMS_Spring.Entities.Role;
import com.ou.LMS_Spring.Entities.User;
import com.ou.LMS_Spring.Services.BaseService;
import com.ou.LMS_Spring.modules.users.dtos.requests.AdminCreateUserResquest;
import com.ou.LMS_Spring.modules.users.dtos.requests.AdminPatchRoleRequest;
import com.ou.LMS_Spring.modules.users.dtos.requests.AdminUpdateUserRequest;
import com.ou.LMS_Spring.modules.users.dtos.responses.AdminUserResponse;
import com.ou.LMS_Spring.modules.users.repositories.RoleRepository;
import com.ou.LMS_Spring.modules.users.repositories.UserRepository;
import com.ou.LMS_Spring.modules.users.services.interfaces.IAdminUserService;


@Service
public class AdminUserService extends BaseService implements IAdminUserService  {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserService(
        UserRepository userRepository,
        RoleRepository roleRepository,
        PasswordEncoder passwordEncoder
    ){
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public List<AdminUserResponse> listAll(){
        return userRepository.findAll().stream()
        .map(this::toResponse)
        .collect((Collectors.toList()));
    }

    @Override
    @Transactional
    public AdminUserResponse create(AdminCreateUserResquest request){
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }

        Role role = roleRepository.findByName(request.getRoleName())
        .orElseThrow(()-> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role not found"));

        User user = new User();
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.getRoles().add(role);

        User saved = userRepository.save(user);

        return toResponse(saved);
    }

    @Override
    @Transactional
    public AdminUserResponse update (Long id, AdminUpdateUserRequest request){
        User user = userRepository.findById(id)
        .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        user.setFullName(request.getFullName().trim());

        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void softDelete(Long id){
        User target = userRepository.findById(id).orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,"User not found"));
        target.setActive(false);
        userRepository.save(target);
    }

    @Override
    @Transactional
    public AdminUserResponse changeRole(Long id, AdminPatchRoleRequest request){
        User user = userRepository.findById(id)
            .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Role role = roleRepository.findByName(request.getRoleName())
            .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found"));
    
        user.getRoles().clear();
        user.getRoles().add(role);
        return toResponse(userRepository.save(user));
    }

    private AdminUserResponse toResponse(User user){
        List<String> roleNames = user.getRoles().stream()
        .map(Role::getName)
        .collect(Collectors.toList());

        return AdminUserResponse.builder()
        .id(user.getId())
        .email(user.getEmail())
        .fullName(user.getFullName())
        .active(user.isActive())
        .roles(roleNames)
        .build();
    }
}

package com.ou.LMS_Spring.modules.users.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ou.LMS_Spring.modules.users.dtos.UserDto;
import com.ou.LMS_Spring.modules.users.dtos.requests.UpdateMeRequest;
import com.ou.LMS_Spring.modules.users.services.interfaces.IUserService;
import com.ou.LMS_Spring.resources.SuccessResource;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    private IUserService userService;

    public UserController
    (
        IUserService userService
    ) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<SuccessResource<UserDto>> me(){
        UserDto userDto = userService.getCurrentUserProfile();
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", userDto));
    }

    @PutMapping("/me")
    public ResponseEntity<SuccessResource<UserDto>> updateMe(@Valid @RequestBody UpdateMeRequest request){
        UserDto userDto = userService.updateCurrentUserProfile(request);
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", userDto));
    }
}

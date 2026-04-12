package com.ou.LMS_Spring.modules.users.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ou.LMS_Spring.modules.users.dtos.requests.AdminCreateUserResquest;
import com.ou.LMS_Spring.modules.users.dtos.requests.AdminPatchRoleRequest;
import com.ou.LMS_Spring.modules.users.dtos.requests.AdminUpdateUserRequest;
import com.ou.LMS_Spring.modules.users.dtos.responses.AdminUserResponse;
import com.ou.LMS_Spring.modules.users.services.interfaces.IAdminUserService;
import com.ou.LMS_Spring.resources.SuccessResource;

import jakarta.validation.Valid;



@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {
    private final IAdminUserService adminUserService;

    public AdminUserController(
        IAdminUserService adminUserService
    ){
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public ResponseEntity<SuccessResource<List<AdminUserResponse>>> list(){
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", adminUserService.listAll()));

    }

    @PostMapping
    public ResponseEntity<SuccessResource<AdminUserResponse>> create(@Valid @RequestBody AdminCreateUserResquest resquest){
        AdminUserResponse body = adminUserService.create(resquest);
        return ResponseEntity.status(HttpStatus.CREATED).body(new SuccessResource<>("CREATED", body));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SuccessResource<AdminUserResponse>> update(
        @PathVariable Long id,
        @Valid @RequestBody AdminUpdateUserRequest request
    ){
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", adminUserService.update(id, request)));

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<SuccessResource<String>> delete(@PathVariable Long id)
    {
        adminUserService.softDelete(id);
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", "User disabled"));

    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<SuccessResource<AdminUserResponse>> patchRole(
        @PathVariable Long id,
        @Valid @RequestBody AdminPatchRoleRequest request
    ){
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", adminUserService.changeRole(id, request)));
    
    }

}

package com.ou.LMS_Spring.modules.users.services.interfaces;

import java.util.List;

import com.ou.LMS_Spring.modules.users.dtos.requests.AdminCreateUserResquest;
import com.ou.LMS_Spring.modules.users.dtos.requests.AdminPatchRoleRequest;
import com.ou.LMS_Spring.modules.users.dtos.requests.AdminUpdateUserRequest;
import com.ou.LMS_Spring.modules.users.dtos.responses.AdminUserResponse;

public interface IAdminUserService {

    List<AdminUserResponse> listAll();

    AdminUserResponse create(AdminCreateUserResquest request);

    AdminUserResponse update(Long id, AdminUpdateUserRequest request);

    void softDelete(Long id);

    AdminUserResponse changeRole(Long id, AdminPatchRoleRequest request);
}

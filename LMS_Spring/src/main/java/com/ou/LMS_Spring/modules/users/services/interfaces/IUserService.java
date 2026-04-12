package com.ou.LMS_Spring.modules.users.services.interfaces;

import com.ou.LMS_Spring.modules.users.dtos.UserDto;
import com.ou.LMS_Spring.modules.users.dtos.requests.UpdateMeRequest;

public interface IUserService {
    
    UserDto getCurrentUserProfile();
    UserDto updateCurrentUserProfile(UpdateMeRequest request);
}

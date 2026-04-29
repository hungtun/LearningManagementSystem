package com.ou.LMS_Spring.modules.users.services.interfaces;

import com.ou.LMS_Spring.modules.users.dtos.UserDto;
import com.ou.LMS_Spring.modules.users.dtos.requests.UpdateMeRequest;
import org.springframework.web.multipart.MultipartFile;

public interface IUserService {

    UserDto getCurrentUserProfile();

    UserDto updateCurrentUserProfile(UpdateMeRequest request);

    UserDto updateCurrentUserAvatar(MultipartFile file);
}

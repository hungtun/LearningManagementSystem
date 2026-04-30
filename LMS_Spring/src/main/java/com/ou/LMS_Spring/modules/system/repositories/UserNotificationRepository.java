package com.ou.LMS_Spring.modules.system.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ou.LMS_Spring.Entities.UserNotification;

@Repository
public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {

    List<UserNotification> findByUser_IdAndIsActiveTrueOrderByCreatedAtDesc(Long userId);

    List<UserNotification> findByUser_IdAndIsActiveTrueAndIsReadFalse(Long userId);
}

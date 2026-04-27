package com.ou.LMS_Spring.modules.system.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ou.LMS_Spring.Entities.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByIsActiveTrueAndRecipient_IdOrIsActiveTrueAndBroadcastTrueOrderByCreatedAtDesc(Long recipientId);
}

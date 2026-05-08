package com.ou.LMS_Spring.modules.systems.services.interfaces;

import java.util.List;

import com.ou.LMS_Spring.modules.systems.dtos.requests.BroadcastNotificationRequest;
import com.ou.LMS_Spring.modules.systems.dtos.requests.UpsertCategoryRequest;
import com.ou.LMS_Spring.modules.systems.dtos.responses.AdminAnalyticsResponse;
import com.ou.LMS_Spring.modules.systems.dtos.responses.CategoryResponse;
import com.ou.LMS_Spring.modules.systems.dtos.responses.InstructorAnalyticsResponse;
import com.ou.LMS_Spring.modules.systems.dtos.responses.NotificationResponse;

public interface ISystemService {

    List<CategoryResponse> listCategories();

    CategoryResponse createCategory(UpsertCategoryRequest request);

    CategoryResponse updateCategory(Long id, UpsertCategoryRequest request);

    void deleteCategory(Long id);

    InstructorAnalyticsResponse getInstructorAnalytics();

    AdminAnalyticsResponse getAdminAnalytics();

    List<NotificationResponse> listMyNotifications();

    void markAllNotificationsRead();

    void broadcastNotification(BroadcastNotificationRequest request);
}

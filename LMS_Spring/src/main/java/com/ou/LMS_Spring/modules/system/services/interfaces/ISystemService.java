package com.ou.LMS_Spring.modules.system.services.interfaces;

import java.util.List;

import com.ou.LMS_Spring.modules.system.dtos.requests.BroadcastNotificationRequest;
import com.ou.LMS_Spring.modules.system.dtos.requests.UpsertCategoryRequest;
import com.ou.LMS_Spring.modules.system.dtos.responses.AdminAnalyticsResponse;
import com.ou.LMS_Spring.modules.system.dtos.responses.CategoryResponse;
import com.ou.LMS_Spring.modules.system.dtos.responses.InstructorAnalyticsResponse;
import com.ou.LMS_Spring.modules.system.dtos.responses.NotificationResponse;

public interface ISystemService {

    List<CategoryResponse> listCategories();

    CategoryResponse createCategory(UpsertCategoryRequest request);

    CategoryResponse updateCategory(Long id, UpsertCategoryRequest request);

    void deleteCategory(Long id);

    InstructorAnalyticsResponse getInstructorAnalytics();

    AdminAnalyticsResponse getAdminAnalytics();

    List<NotificationResponse> listMyNotifications();

    NotificationResponse broadcastNotification(BroadcastNotificationRequest request);
}

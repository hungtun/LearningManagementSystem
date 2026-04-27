package com.ou.LMS_Spring.modules.system.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ou.LMS_Spring.modules.system.dtos.responses.AdminAnalyticsResponse;
import com.ou.LMS_Spring.modules.system.dtos.responses.CategoryResponse;
import com.ou.LMS_Spring.modules.system.dtos.responses.InstructorAnalyticsResponse;
import com.ou.LMS_Spring.modules.system.dtos.responses.NotificationResponse;
import com.ou.LMS_Spring.modules.system.services.interfaces.ISystemService;
import com.ou.LMS_Spring.resources.SuccessResource;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/system")
@RequiredArgsConstructor
public class SystemController {

    private final ISystemService systemService;

    @GetMapping("/categories")
    public ResponseEntity<SuccessResource<List<CategoryResponse>>> listCategories() {
        List<CategoryResponse> data = systemService.listCategories();
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", data));
    }

    @GetMapping("/analytics/instructor")
    public ResponseEntity<SuccessResource<InstructorAnalyticsResponse>> instructorAnalytics() {
        InstructorAnalyticsResponse data = systemService.getInstructorAnalytics();
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", data));
    }

    @GetMapping("/analytics/admin")
    public ResponseEntity<SuccessResource<AdminAnalyticsResponse>> adminAnalytics() {
        AdminAnalyticsResponse data = systemService.getAdminAnalytics();
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", data));
    }

    @GetMapping("/notifications")
    public ResponseEntity<SuccessResource<List<NotificationResponse>>> myNotifications() {
        List<NotificationResponse> data = systemService.listMyNotifications();
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", data));
    }
}

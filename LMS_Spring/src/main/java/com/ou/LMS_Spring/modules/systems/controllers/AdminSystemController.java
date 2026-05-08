package com.ou.LMS_Spring.modules.systems.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ou.LMS_Spring.modules.systems.dtos.requests.BroadcastNotificationRequest;
import com.ou.LMS_Spring.modules.systems.dtos.requests.UpsertCategoryRequest;
import com.ou.LMS_Spring.modules.systems.dtos.responses.CategoryResponse;
import com.ou.LMS_Spring.modules.systems.services.interfaces.ISystemService;
import com.ou.LMS_Spring.resources.SuccessResource;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/system")
@RequiredArgsConstructor
public class AdminSystemController {

    private final ISystemService systemService;

    @PostMapping("/categories")
    public ResponseEntity<SuccessResource<CategoryResponse>> createCategory(
            @Valid @RequestBody UpsertCategoryRequest request) {
        CategoryResponse body = systemService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResource<>("CREATED", body));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<SuccessResource<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody UpsertCategoryRequest request) {
        CategoryResponse body = systemService.updateCategory(id, request);
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", body));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<SuccessResource<String>> deleteCategory(@PathVariable Long id) {
        systemService.deleteCategory(id);
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", "Category deleted"));
    }

    @PostMapping("/notifications/broadcast")
    public ResponseEntity<SuccessResource<String>> broadcastNotification(
            @Valid @RequestBody BroadcastNotificationRequest request) {
        systemService.broadcastNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResource<>("CREATED", "Notification sent to all users"));
    }
}

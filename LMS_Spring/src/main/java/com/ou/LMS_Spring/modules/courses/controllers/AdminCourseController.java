package com.ou.LMS_Spring.modules.courses.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ou.LMS_Spring.modules.courses.dtos.requests.AdminCourseStatusRequest;
import com.ou.LMS_Spring.modules.courses.dtos.responses.CourseDetailResponse;
import com.ou.LMS_Spring.modules.courses.dtos.responses.CourseSummaryResponse;
import com.ou.LMS_Spring.modules.courses.dtos.responses.LessonDetailResponse;
import com.ou.LMS_Spring.modules.courses.services.interfaces.ICourseService;

import jakarta.validation.Valid;

@Validated
@RestController
@RequestMapping("/api/admin/courses")
public class AdminCourseController {

    private final ICourseService courseService;

    public AdminCourseController(ICourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping("/pending")
    public ResponseEntity<List<CourseSummaryResponse>> listPending() {
        return ResponseEntity.ok(courseService.listPendingReview());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseDetailResponse> getCourseDetail(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.adminGetCourseDetail(id));
    }

    @GetMapping("/lessons/{lessonId}")
    public ResponseEntity<LessonDetailResponse> getLessonDetail(
            @PathVariable Long lessonId) {
        return ResponseEntity.ok(courseService.adminGetLessonDetail(lessonId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<CourseDetailResponse> updateStatus(@PathVariable Long id,
            @Valid @RequestBody AdminCourseStatusRequest request) {
        return ResponseEntity.ok(courseService.adminUpdateStatus(id, request));
    }
}

package com.ou.LMS_Spring.modules.enrollments.controllers;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ou.LMS_Spring.modules.enrollments.dtos.requests.EnrollmentRequest;
import com.ou.LMS_Spring.modules.enrollments.dtos.responses.CourseStudentResponse;
import com.ou.LMS_Spring.modules.enrollments.dtos.responses.EnrollmentResponse;
import com.ou.LMS_Spring.modules.enrollments.dtos.responses.EnrollmentStatsResponse;
import com.ou.LMS_Spring.modules.enrollments.dtos.responses.MyCourseItemResponse;
import com.ou.LMS_Spring.modules.enrollments.services.interfaces.IEnrollmentService;
import com.ou.LMS_Spring.resources.SuccessResource;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final IEnrollmentService enrollmentService;

    @PostMapping
    public ResponseEntity<SuccessResource<EnrollmentResponse>> enroll(
            @Valid @RequestBody EnrollmentRequest request) {
        EnrollmentResponse body = enrollmentService.enroll(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResource<>("CREATED", body));
    }

    @GetMapping("/my-courses")
    public ResponseEntity<SuccessResource<List<MyCourseItemResponse>>> myCourses() {
        List<MyCourseItemResponse> data = enrollmentService.myCourses();
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", data));
    }

    @GetMapping("/course/{courseId}/students")
    public ResponseEntity<SuccessResource<List<CourseStudentResponse>>> students(
            @PathVariable Long courseId) {
        List<CourseStudentResponse> data = enrollmentService.listStudentsForCourse(courseId);
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", data));
    }

    @GetMapping("/stats")
    public ResponseEntity<SuccessResource<List<EnrollmentStatsResponse>>> stats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        List<EnrollmentStatsResponse> data = enrollmentService.enrollmentStats(from, to);
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", data));
    }
}

package com.ou.LMS_Spring.modules.courses.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ou.LMS_Spring.modules.courses.dtos.requests.CourseCreateRequest;
import com.ou.LMS_Spring.modules.courses.dtos.requests.CourseUpdateRequest;
import com.ou.LMS_Spring.modules.courses.dtos.requests.LessonCreateRequest;
import com.ou.LMS_Spring.modules.courses.dtos.requests.LessonReorderRequest;
import com.ou.LMS_Spring.modules.courses.dtos.requests.LessonUpdateRequest;
import com.ou.LMS_Spring.modules.courses.dtos.responses.CourseDetailResponse;
import com.ou.LMS_Spring.modules.courses.dtos.responses.CourseSummaryResponse;
import com.ou.LMS_Spring.modules.courses.dtos.responses.LessonAttachmentResponse;
import com.ou.LMS_Spring.modules.courses.dtos.responses.LessonDetailResponse;
import com.ou.LMS_Spring.modules.courses.services.interfaces.ICourseService;

import jakarta.validation.Valid;

@Validated
@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final ICourseService courseService;

    public CourseController(ICourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public ResponseEntity<List<CourseSummaryResponse>> listPublished() {
        return ResponseEntity.ok(courseService.listPublishedCourses());
    }

    @GetMapping("/my")
    public ResponseEntity<List<CourseSummaryResponse>> listMyCourses() {
        return ResponseEntity.ok(courseService.listMyCoursesAsInstructor());
    }

    @GetMapping("/lessons/{lessonId}")
    public ResponseEntity<LessonDetailResponse> getPublishedLesson(@PathVariable Long lessonId) {
        return ResponseEntity.ok(courseService.getPublishedLesson(lessonId));
    }

    @GetMapping("/my/lessons/{lessonId}")
    public ResponseEntity<LessonDetailResponse> getMyLesson(@PathVariable Long lessonId) {
        return ResponseEntity.ok(courseService.getMyLessonDetail(lessonId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseDetailResponse> getPublishedDetail(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getPublishedCourseDetail(id));
    }

    @GetMapping("/my/{id}")
    public ResponseEntity<CourseDetailResponse> getMyCourseDetail(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getMyCourseDetail(id));
    }

    @PostMapping
    public ResponseEntity<CourseDetailResponse> create(@Valid @RequestBody CourseCreateRequest request) {
        CourseDetailResponse body = courseService.createCourse(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseDetailResponse> update(@PathVariable Long id,
            @Valid @RequestBody CourseUpdateRequest request) {
        return ResponseEntity.ok(courseService.updateCourse(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/lessons")
    public ResponseEntity<LessonDetailResponse> addLesson(@PathVariable Long id,
            @Valid @RequestBody LessonCreateRequest request) {
        LessonDetailResponse body = courseService.addLesson(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PutMapping("/lessons/{lessonId}")
    public ResponseEntity<LessonDetailResponse> updateLesson(@PathVariable Long lessonId,
            @Valid @RequestBody LessonUpdateRequest request) {
        return ResponseEntity.ok(courseService.updateLesson(lessonId, request));
    }

    @DeleteMapping("/lessons/{lessonId}")
    public ResponseEntity<Void> deleteLesson(@PathVariable Long lessonId) {
        courseService.deleteLesson(lessonId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/lessons/{lessonId}/reorder")
    public ResponseEntity<LessonDetailResponse> reorderLesson(@PathVariable Long lessonId,
            @Valid @RequestBody LessonReorderRequest request) {
        return ResponseEntity.ok(courseService.reorderLesson(lessonId, request));
    }

    @PostMapping(value = "/lessons/{lessonId}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<LessonAttachmentResponse> uploadAttachment(
            @PathVariable Long lessonId,
            @RequestPart("file") MultipartFile file) {
        LessonAttachmentResponse body = courseService.uploadAttachment(lessonId, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @DeleteMapping("/lessons/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long attachmentId) {
        courseService.deleteAttachment(attachmentId);
        return ResponseEntity.noContent().build();
    }
}

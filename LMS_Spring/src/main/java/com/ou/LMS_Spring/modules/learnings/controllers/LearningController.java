package com.ou.LMS_Spring.modules.learnings.controllers;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ou.LMS_Spring.modules.learnings.dtos.CertificateDownload;
import com.ou.LMS_Spring.modules.learnings.dtos.requests.DiscussionCreateRequest;
import com.ou.LMS_Spring.modules.learnings.dtos.requests.ReviewCreateRequest;
import com.ou.LMS_Spring.modules.learnings.dtos.requests.VideoProgressPatchRequest;
import com.ou.LMS_Spring.modules.learnings.dtos.responses.CourseProgressResponse;
import com.ou.LMS_Spring.modules.learnings.dtos.responses.DiscussionResponse;
import com.ou.LMS_Spring.modules.learnings.dtos.responses.LessonProgressItemResponse;
import com.ou.LMS_Spring.modules.learnings.dtos.responses.ReviewResponse;
import com.ou.LMS_Spring.modules.learnings.dtos.responses.VideoProgressResponse;
import com.ou.LMS_Spring.modules.learnings.services.interfaces.ILearningService;
import com.ou.LMS_Spring.resources.SuccessResource;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Validated
@RestController
@RequestMapping("/api/learnings")
@RequiredArgsConstructor
public class LearningController {

    private final ILearningService learningService;

    @PatchMapping("/video")
    public ResponseEntity<SuccessResource<VideoProgressResponse>> patchVideoProgress(
            @Valid @RequestBody VideoProgressPatchRequest request) {
        VideoProgressResponse body = learningService.patchVideoProgress(request);
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", body));
    }

    @GetMapping("/course/{courseId}/progress")
    public ResponseEntity<SuccessResource<CourseProgressResponse>> courseProgress(
            @PathVariable Long courseId) {
        CourseProgressResponse body = learningService.getCourseProgress(courseId);
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", body));
    }

    @GetMapping("/course/{courseId}/lesson-progress")
    public ResponseEntity<SuccessResource<List<LessonProgressItemResponse>>> lessonProgresses(
            @PathVariable Long courseId) {
        List<LessonProgressItemResponse> body = learningService.getLessonProgresses(courseId);
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", body));
    }

    @PostMapping("/discussions")
    public ResponseEntity<SuccessResource<DiscussionResponse>> createDiscussion(
            @Valid @RequestBody DiscussionCreateRequest request) {
        DiscussionResponse body = learningService.createDiscussion(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResource<>("CREATED", body));
    }

    @GetMapping("/discussions/{lessonId}")
    public ResponseEntity<SuccessResource<List<DiscussionResponse>>> listDiscussions(
            @PathVariable Long lessonId) {
        List<DiscussionResponse> body = learningService.listDiscussions(lessonId);
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", body));
    }

    @PostMapping("/reviews")
    public ResponseEntity<SuccessResource<ReviewResponse>> createReview(
            @Valid @RequestBody ReviewCreateRequest request) {
        ReviewResponse body = learningService.createReview(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResource<>("CREATED", body));
    }

    @GetMapping("/reviews/course/{courseId}")
    public ResponseEntity<SuccessResource<List<ReviewResponse>>> listCourseReviews(
            @PathVariable Long courseId) {
        List<ReviewResponse> body = learningService.listCourseReviews(courseId);
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", body));
    }

    @GetMapping("/certificate/{courseId}")
    public ResponseEntity<byte[]> certificate(
            @PathVariable Long courseId,
            @RequestParam(name = "format", required = false) String format) {
        CertificateDownload file = learningService.downloadCertificate(courseId, format);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"")
                .contentType(file.getMediaType())
                .body(file.getBody());
    }
}

package com.ou.LMS_Spring.modules.assessments.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ou.LMS_Spring.modules.assessments.dtos.requests.InstructorGradeRequest;
import com.ou.LMS_Spring.modules.assessments.dtos.requests.QuizSubmitRequest;
import com.ou.LMS_Spring.modules.assessments.dtos.responses.AssessmentQuizResponse;
import com.ou.LMS_Spring.modules.assessments.dtos.responses.AssignmentSubmitResponse;
import com.ou.LMS_Spring.modules.assessments.dtos.responses.InstructorSubmissionItemResponse;
import com.ou.LMS_Spring.modules.assessments.dtos.responses.QuizSubmitResponse;
import com.ou.LMS_Spring.modules.assessments.services.interfaces.IAssessmentService;
import com.ou.LMS_Spring.resources.SuccessResource;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Validated
@RestController
@RequestMapping("/api/assessments")
@RequiredArgsConstructor
public class AssessmentController {

    private final IAssessmentService assessmentService;

    @GetMapping("/quiz/{id}")
    public ResponseEntity<SuccessResource<AssessmentQuizResponse>> getQuiz(@PathVariable Long id) {
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", assessmentService.getQuiz(id)));
    }

    @PostMapping("/quiz/submit")
    public ResponseEntity<SuccessResource<QuizSubmitResponse>> submitQuiz(@Valid @RequestBody QuizSubmitRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResource<>("CREATED", assessmentService.submitQuiz(request)));
    }

    @PostMapping(value = "/assignments/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SuccessResource<AssignmentSubmitResponse>> submitAssignment(
            @RequestParam("lessonId") Long lessonId,
            @RequestPart("file") MultipartFile file,
            @RequestParam(value = "note", required = false) String note) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResource<>("CREATED", assessmentService.submitAssignment(lessonId, file, note)));
    }

    @GetMapping("/instructor/submissions")
    public ResponseEntity<SuccessResource<List<InstructorSubmissionItemResponse>>> instructorSubmissions() {
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", assessmentService.instructorSubmissions()));
    }

    @PatchMapping("/instructor/grade")
    public ResponseEntity<SuccessResource<InstructorSubmissionItemResponse>> gradeSubmission(
            @Valid @RequestBody InstructorGradeRequest request) {
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", assessmentService.gradeSubmission(request)));
    }
}

package com.ou.LMS_Spring.modules.assessments.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ou.LMS_Spring.modules.assessments.dtos.requests.InstructorAssignmentCreateRequest;
import com.ou.LMS_Spring.modules.assessments.dtos.requests.InstructorAssignmentUpdateRequest;
import com.ou.LMS_Spring.modules.assessments.dtos.requests.InstructorGradeRequest;
import com.ou.LMS_Spring.modules.assessments.dtos.requests.InstructorQuizCreateRequest;
import com.ou.LMS_Spring.modules.assessments.dtos.requests.InstructorQuizUpdateRequest;
import com.ou.LMS_Spring.modules.assessments.dtos.requests.QuizQuestionRequest;
import com.ou.LMS_Spring.modules.assessments.dtos.requests.QuizSubmitRequest;
import com.ou.LMS_Spring.modules.assessments.dtos.responses.AssessmentQuizResponse;
import com.ou.LMS_Spring.modules.assessments.dtos.responses.AssignmentSubmitResponse;
import com.ou.LMS_Spring.modules.assessments.dtos.responses.InstructorAssignmentResponse;
import com.ou.LMS_Spring.modules.assessments.dtos.responses.InstructorQuizResponse;
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

    @GetMapping("/quiz/lesson/{lessonId}")
    public ResponseEntity<SuccessResource<AssessmentQuizResponse>> getQuizByLessonForStudent(@PathVariable Long lessonId) {
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", assessmentService.getQuizByLessonForStudent(lessonId)));
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

    @GetMapping("/assignment/lesson/{lessonId}")
    public ResponseEntity<SuccessResource<InstructorAssignmentResponse>> getAssignmentByLessonForStudent(@PathVariable Long lessonId) {
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", assessmentService.getAssignmentByLessonForStudent(lessonId)));
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

    // ---- Instructor quiz CRUD endpoints ----

    @GetMapping("/instructor/quiz/lesson/{lessonId}")
    public ResponseEntity<SuccessResource<InstructorQuizResponse>> getQuizByLesson(@PathVariable Long lessonId) {
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", assessmentService.getQuizByLesson(lessonId)));
    }

    @PostMapping("/instructor/quiz")
    public ResponseEntity<SuccessResource<InstructorQuizResponse>> createQuiz(
            @Valid @RequestBody InstructorQuizCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResource<>("CREATED", assessmentService.createQuiz(request)));
    }

    @PutMapping("/instructor/quiz/{quizId}")
    public ResponseEntity<SuccessResource<InstructorQuizResponse>> updateQuiz(
            @PathVariable Long quizId,
            @Valid @RequestBody InstructorQuizUpdateRequest request) {
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", assessmentService.updateQuiz(quizId, request)));
    }

    @DeleteMapping("/instructor/quiz/{quizId}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long quizId) {
        assessmentService.deleteQuiz(quizId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/instructor/quiz/{quizId}/questions")
    public ResponseEntity<SuccessResource<InstructorQuizResponse>> addQuestion(
            @PathVariable Long quizId,
            @Valid @RequestBody QuizQuestionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResource<>("CREATED", assessmentService.addQuestion(quizId, request)));
    }

    @PutMapping("/instructor/quiz/{quizId}/questions/{questionId}")
    public ResponseEntity<SuccessResource<InstructorQuizResponse>> updateQuestion(
            @PathVariable Long quizId,
            @PathVariable Long questionId,
            @Valid @RequestBody QuizQuestionRequest request) {
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", assessmentService.updateQuestion(quizId, questionId, request)));
    }

    @DeleteMapping("/instructor/quiz/{quizId}/questions/{questionId}")
    public ResponseEntity<SuccessResource<InstructorQuizResponse>> deleteQuestion(
            @PathVariable Long quizId,
            @PathVariable Long questionId) {
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", assessmentService.deleteQuestion(quizId, questionId)));
    }

    // ---- Instructor assignment CRUD endpoints ----

    @GetMapping("/instructor/assignment/lesson/{lessonId}")
    public ResponseEntity<SuccessResource<InstructorAssignmentResponse>> getAssignmentByLesson(@PathVariable Long lessonId) {
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", assessmentService.getAssignmentByLesson(lessonId)));
    }

    @PostMapping("/instructor/assignment")
    public ResponseEntity<SuccessResource<InstructorAssignmentResponse>> createAssignment(
            @Valid @RequestBody InstructorAssignmentCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResource<>("CREATED", assessmentService.createAssignment(request)));
    }

    @PutMapping("/instructor/assignment/{assignmentId}")
    public ResponseEntity<SuccessResource<InstructorAssignmentResponse>> updateAssignment(
            @PathVariable Long assignmentId,
            @Valid @RequestBody InstructorAssignmentUpdateRequest request) {
        return ResponseEntity.ok(new SuccessResource<>("SUCCESS", assessmentService.updateAssignment(assignmentId, request)));
    }

    @DeleteMapping("/instructor/assignment/{assignmentId}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long assignmentId) {
        assessmentService.deleteAssignment(assignmentId);
        return ResponseEntity.noContent().build();
    }
}

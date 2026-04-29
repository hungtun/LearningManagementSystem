package com.ou.LMS_Spring.modules.assessments.services.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.ou.LMS_Spring.Entities.AssessmentQuestionOption;
import com.ou.LMS_Spring.Entities.AssessmentQuiz;
import com.ou.LMS_Spring.Entities.AssessmentQuizQuestion;
import com.ou.LMS_Spring.Entities.AssessmentQuizSubmission;
import com.ou.LMS_Spring.Entities.AssessmentQuizSubmissionAnswer;
import com.ou.LMS_Spring.Entities.AssignmentSubmission;
import com.ou.LMS_Spring.Entities.Lesson;
import com.ou.LMS_Spring.Entities.User;
import com.ou.LMS_Spring.helpers.ApiBusinessException;
import com.ou.LMS_Spring.modules.assessments.dtos.requests.InstructorGradeRequest;
import com.ou.LMS_Spring.modules.assessments.dtos.requests.QuizSubmitRequest;
import com.ou.LMS_Spring.modules.assessments.dtos.responses.AssessmentQuizResponse;
import com.ou.LMS_Spring.modules.assessments.dtos.responses.AssignmentSubmitResponse;
import com.ou.LMS_Spring.modules.assessments.dtos.responses.InstructorSubmissionItemResponse;
import com.ou.LMS_Spring.modules.assessments.dtos.responses.QuizSubmitResponse;
import com.ou.LMS_Spring.modules.assessments.repositories.AssessmentQuizQuestionRepository;
import com.ou.LMS_Spring.modules.assessments.repositories.AssessmentQuizRepository;
import com.ou.LMS_Spring.modules.assessments.repositories.AssessmentQuizSubmissionAnswerRepository;
import com.ou.LMS_Spring.modules.assessments.repositories.AssessmentQuizSubmissionRepository;
import com.ou.LMS_Spring.modules.assessments.repositories.AssignmentSubmissionRepository;
import com.ou.LMS_Spring.modules.assessments.services.interfaces.IAssessmentService;
import com.ou.LMS_Spring.modules.courses.repositories.LessonRepository;
import com.ou.LMS_Spring.modules.enrollments.repositories.EnrollmentRepository;
import com.ou.LMS_Spring.modules.users.repositories.UserRepository;
import com.ou.LMS_Spring.resources.ErrorResource;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AssessmentService implements IAssessmentService {

    private static final String ERR_CODE = "code";

    private final AssessmentQuizRepository assessmentQuizRepository;
    private final AssessmentQuizQuestionRepository assessmentQuizQuestionRepository;
    private final AssessmentQuizSubmissionRepository assessmentQuizSubmissionRepository;
    private final AssessmentQuizSubmissionAnswerRepository assessmentQuizSubmissionAnswerRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final LessonRepository lessonRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public AssessmentQuizResponse getQuiz(Long id) {
        User user = currentUser();
        AssessmentQuiz quiz = assessmentQuizRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> quizNotFound(id));
        assertEnrolled(user.getId(), quiz.getLesson().getCourse().getId());

        List<AssessmentQuizResponse.QuizQuestionResponse> questions = assessmentQuizQuestionRepository
                .findByQuiz_IdOrderByOrderIndexAsc(quiz.getId())
                .stream()
                .map(q -> new AssessmentQuizResponse.QuizQuestionResponse(
                        q.getId(),
                        q.getQuestionText(),
                        q.getOptionA(),
                        q.getOptionB(),
                        q.getOptionC(),
                        q.getOptionD()))
                .collect(Collectors.toList());

        return new AssessmentQuizResponse(
                quiz.getId(),
                quiz.getLesson().getId(),
                quiz.getTitle(),
                quiz.getDescription(),
                quiz.getPassScore(),
                questions);
    }

    @Override
    @Transactional
    public QuizSubmitResponse submitQuiz(QuizSubmitRequest request) {
        User user = currentUser();
        AssessmentQuiz quiz = assessmentQuizRepository.findByIdAndIsActiveTrue(request.getQuizId())
                .orElseThrow(() -> quizNotFound(request.getQuizId()));
        assertEnrolled(user.getId(), quiz.getLesson().getCourse().getId());

        List<AssessmentQuizQuestion> questions = assessmentQuizQuestionRepository.findByQuiz_IdOrderByOrderIndexAsc(quiz.getId());
        if (questions.isEmpty()) {
            throw noQuizQuestions();
        }
        Map<Long, AssessmentQuestionOption> answerByQuestion = request.getAnswers().stream()
                .collect(Collectors.toMap(QuizSubmitRequest.QuizAnswerRequest::getQuestionId,
                        QuizSubmitRequest.QuizAnswerRequest::getSelectedOption,
                        (a, b) -> b));

        int score = 0;
        int maxScore = questions.stream().mapToInt(AssessmentQuizQuestion::getPoint).sum();

        AssessmentQuizSubmission submission = new AssessmentQuizSubmission();
        submission.setQuiz(quiz);
        submission.setStudent(user);
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setScore(0);
        submission.setMaxScore(maxScore);
        AssessmentQuizSubmission savedSubmission = assessmentQuizSubmissionRepository.save(submission);

        for (AssessmentQuizQuestion question : questions) {
            AssessmentQuestionOption selected = answerByQuestion.get(question.getId());
            if (selected == null) {
                continue;
            }
            boolean correct = selected == question.getCorrectOption();
            int earned = correct ? question.getPoint() : 0;
            score += earned;

            AssessmentQuizSubmissionAnswer detail = new AssessmentQuizSubmissionAnswer();
            detail.setSubmission(savedSubmission);
            detail.setQuestion(question);
            detail.setSelectedOption(selected);
            detail.setCorrect(correct);
            detail.setEarnedPoint(earned);
            assessmentQuizSubmissionAnswerRepository.save(detail);
        }

        savedSubmission.setScore(score);
        savedSubmission.setMaxScore(maxScore);
        savedSubmission.setGradedAt(LocalDateTime.now());
        savedSubmission.setFeedback("Auto graded");
        assessmentQuizSubmissionRepository.save(savedSubmission);

        boolean passed = score >= quiz.getPassScore();
        return new QuizSubmitResponse(savedSubmission.getId(), score, maxScore, passed);
    }

    @Override
    @Transactional
    public AssignmentSubmitResponse submitAssignment(Long lessonId, MultipartFile file, String note) {
        User user = currentUser();
        if (file == null || file.isEmpty()) {
            throw fileRequired();
        }

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> lessonNotFound(lessonId));
        assertEnrolled(user.getId(), lesson.getCourse().getId());

        String originalFilename = file.getOriginalFilename() == null ? "assignment-file" : file.getOriginalFilename();
        String generatedFilename = UUID.randomUUID() + "-" + sanitizeFilename(originalFilename);
        Path uploadDir = Paths.get("uploads", "assessments", "assignments");
        try {
            Files.createDirectories(uploadDir);
            Path target = uploadDir.resolve(generatedFilename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            AssignmentSubmission submission = new AssignmentSubmission();
            submission.setLesson(lesson);
            submission.setStudent(user);
            submission.setOriginalFilename(originalFilename);
            submission.setFilePath(target.toString().replace("\\", "/"));
            submission.setSubmittedAt(LocalDateTime.now());
            submission.setNote(note != null && !note.isBlank() ? note.trim() : null);
            AssignmentSubmission saved = assignmentSubmissionRepository.save(submission);

            return new AssignmentSubmitResponse(
                    saved.getId(),
                    lesson.getId(),
                    saved.getOriginalFilename(),
                    saved.getSubmittedAt());
        } catch (IOException ex) {
            throw storeFileFailed(ex.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<InstructorSubmissionItemResponse> instructorSubmissions() {
        User current = currentUser();
        assertInstructorOrAdmin();

        List<InstructorSubmissionItemResponse> rows = new ArrayList<>();
        List<AssessmentQuizSubmission> quizSubmissions = assessmentQuizSubmissionRepository
                .findByQuiz_Lesson_Course_Instructor_IdOrderBySubmittedAtDesc(current.getId());
        for (AssessmentQuizSubmission row : quizSubmissions) {
            rows.add(new InstructorSubmissionItemResponse(
                    "QUIZ",
                    row.getId(),
                    row.getQuiz().getLesson().getCourse().getId(),
                    row.getQuiz().getLesson().getId(),
                    row.getStudent().getId(),
                    row.getStudent().getFullName(),
                    row.getScore(),
                    row.getMaxScore(),
                    row.getFeedback(),
                    row.getSubmittedAt(),
                    row.getGradedAt()));
        }

        List<AssignmentSubmission> assignmentSubmissions = assignmentSubmissionRepository
                .findByLesson_Course_Instructor_IdOrderBySubmittedAtDesc(current.getId());
        for (AssignmentSubmission row : assignmentSubmissions) {
            rows.add(new InstructorSubmissionItemResponse(
                    "ASSIGNMENT",
                    row.getId(),
                    row.getLesson().getCourse().getId(),
                    row.getLesson().getId(),
                    row.getStudent().getId(),
                    row.getStudent().getFullName(),
                    row.getScore(),
                    100,
                    row.getFeedback(),
                    row.getSubmittedAt(),
                    row.getGradedAt()));
        }
        rows.sort((a, b) -> b.getSubmittedAt().compareTo(a.getSubmittedAt()));
        return rows;
    }

    @Override
    @Transactional
    public InstructorSubmissionItemResponse gradeSubmission(InstructorGradeRequest request) {
        User instructor = currentUser();
        assertInstructorOrAdmin();
        String type = request.getSubmissionType().trim().toUpperCase();
        if ("QUIZ".equals(type)) {
            AssessmentQuizSubmission row = assessmentQuizSubmissionRepository.findById(request.getSubmissionId())
                    .orElseThrow(() -> submissionNotFound(request.getSubmissionId()));
            assertCourseInstructor(row.getQuiz().getLesson().getCourse().getInstructor(), instructor);
            row.setScore(request.getScore());
            row.setFeedback(request.getFeedback());
            row.setGradedAt(LocalDateTime.now());
            row.setGradedBy(instructor);
            AssessmentQuizSubmission saved = assessmentQuizSubmissionRepository.save(row);
            return new InstructorSubmissionItemResponse(
                    "QUIZ",
                    saved.getId(),
                    saved.getQuiz().getLesson().getCourse().getId(),
                    saved.getQuiz().getLesson().getId(),
                    saved.getStudent().getId(),
                    saved.getStudent().getFullName(),
                    saved.getScore(),
                    saved.getMaxScore(),
                    saved.getFeedback(),
                    saved.getSubmittedAt(),
                    saved.getGradedAt());
        }

        if ("ASSIGNMENT".equals(type)) {
            AssignmentSubmission row = assignmentSubmissionRepository.findById(request.getSubmissionId())
                    .orElseThrow(() -> submissionNotFound(request.getSubmissionId()));
            assertCourseInstructor(row.getLesson().getCourse().getInstructor(), instructor);
            row.setScore(request.getScore());
            row.setFeedback(request.getFeedback());
            row.setGradedAt(LocalDateTime.now());
            row.setGradedBy(instructor);
            AssignmentSubmission saved = assignmentSubmissionRepository.save(row);
            return new InstructorSubmissionItemResponse(
                    "ASSIGNMENT",
                    saved.getId(),
                    saved.getLesson().getCourse().getId(),
                    saved.getLesson().getId(),
                    saved.getStudent().getId(),
                    saved.getStudent().getFullName(),
                    saved.getScore(),
                    100,
                    saved.getFeedback(),
                    saved.getSubmittedAt(),
                    saved.getGradedAt());
        }
        throw invalidSubmissionType();
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    private void assertEnrolled(Long userId, Long courseId) {
        if (!enrollmentRepository.existsByUser_IdAndCourse_Id(userId, courseId)) {
            throw notEnrolled();
        }
    }

    private void assertInstructorOrAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getAuthorities() == null) {
            throw instructorPermissionDenied();
        }
        boolean allowed = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> "ROLE_ADMIN".equals(a) || "ROLE_INSTRUCTOR".equals(a));
        if (!allowed) {
            throw instructorPermissionDenied();
        }
    }

    private void assertCourseInstructor(User courseInstructor, User current) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities() != null && auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
        if (isAdmin) {
            return;
        }
        if (courseInstructor == null || !courseInstructor.getId().equals(current.getId())) {
            throw instructorPermissionDenied();
        }
    }

    private String sanitizeFilename(String input) {
        return input.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private static ApiBusinessException quizNotFound(Long quizId) {
        Map<String, String> errors = new HashMap<>();
        errors.put(ERR_CODE, "QUIZ_NOT_FOUND");
        errors.put("quizId", String.valueOf(quizId));
        return new ApiBusinessException(HttpStatus.NOT_FOUND, new ErrorResource("Quiz not found", errors));
    }

    private static ApiBusinessException lessonNotFound(Long lessonId) {
        Map<String, String> errors = new HashMap<>();
        errors.put(ERR_CODE, "LESSON_NOT_FOUND");
        errors.put("lessonId", String.valueOf(lessonId));
        return new ApiBusinessException(HttpStatus.NOT_FOUND, new ErrorResource("Lesson not found", errors));
    }

    private static ApiBusinessException noQuizQuestions() {
        Map<String, String> errors = new HashMap<>();
        errors.put(ERR_CODE, "QUIZ_NO_QUESTIONS");
        return new ApiBusinessException(HttpStatus.BAD_REQUEST, new ErrorResource("Quiz has no questions", errors));
    }

    private static ApiBusinessException notEnrolled() {
        Map<String, String> errors = new HashMap<>();
        errors.put(ERR_CODE, "NOT_ENROLLED");
        errors.put("message", "You must be enrolled in this course");
        return new ApiBusinessException(HttpStatus.FORBIDDEN, new ErrorResource("Not enrolled", errors));
    }

    private static ApiBusinessException fileRequired() {
        Map<String, String> errors = new HashMap<>();
        errors.put(ERR_CODE, "FILE_REQUIRED");
        errors.put("message", "Please upload assignment file");
        return new ApiBusinessException(HttpStatus.BAD_REQUEST, new ErrorResource("File required", errors));
    }

    private static ApiBusinessException storeFileFailed(String message) {
        Map<String, String> errors = new HashMap<>();
        errors.put(ERR_CODE, "FILE_STORE_FAILED");
        errors.put("message", message);
        return new ApiBusinessException(HttpStatus.INTERNAL_SERVER_ERROR, new ErrorResource("Could not store file", errors));
    }

    private static ApiBusinessException instructorPermissionDenied() {
        Map<String, String> errors = new HashMap<>();
        errors.put(ERR_CODE, "INSTRUCTOR_PERMISSION_DENIED");
        return new ApiBusinessException(HttpStatus.FORBIDDEN, new ErrorResource("Instructor permission denied", errors));
    }

    private static ApiBusinessException submissionNotFound(Long submissionId) {
        Map<String, String> errors = new HashMap<>();
        errors.put(ERR_CODE, "SUBMISSION_NOT_FOUND");
        errors.put("submissionId", String.valueOf(submissionId));
        return new ApiBusinessException(HttpStatus.NOT_FOUND, new ErrorResource("Submission not found", errors));
    }

    private static ApiBusinessException invalidSubmissionType() {
        Map<String, String> errors = new HashMap<>();
        errors.put(ERR_CODE, "INVALID_SUBMISSION_TYPE");
        errors.put("acceptedValues", "QUIZ,ASSIGNMENT");
        return new ApiBusinessException(HttpStatus.BAD_REQUEST, new ErrorResource("Invalid submission type", errors));
    }
}

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

import com.ou.LMS_Spring.Entities.AssessmentAssignment;
import com.ou.LMS_Spring.Entities.AssessmentQuestionOption;
import com.ou.LMS_Spring.Entities.AssessmentQuiz;
import com.ou.LMS_Spring.Entities.AssessmentQuizQuestion;
import com.ou.LMS_Spring.Entities.AssessmentQuizSubmission;
import com.ou.LMS_Spring.Entities.AssessmentQuizSubmissionAnswer;
import com.ou.LMS_Spring.Entities.AssignmentSubmission;
import com.ou.LMS_Spring.Entities.Lesson;
import com.ou.LMS_Spring.Entities.User;
import com.ou.LMS_Spring.helpers.ApiBusinessException;
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
import com.ou.LMS_Spring.modules.assessments.repositories.AssessmentAssignmentRepository;
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
    private final AssessmentAssignmentRepository assessmentAssignmentRepository;
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
        return toStudentQuizResponse(quiz);
    }

    @Override
    @Transactional(readOnly = true)
    public AssessmentQuizResponse getQuizByLessonForStudent(Long lessonId) {
        User user = currentUser();
        AssessmentQuiz quiz = assessmentQuizRepository.findByLesson_Id(lessonId)
                .orElseThrow(() -> quizNotFound(lessonId));
        assertEnrolled(user.getId(), quiz.getLesson().getCourse().getId());
        return toStudentQuizResponse(quiz);
    }

    @Override
    @Transactional
    public QuizSubmitResponse submitQuiz(QuizSubmitRequest request) {
        User user = currentUser();
        AssessmentQuiz quiz = assessmentQuizRepository.findByIdAndIsActiveTrue(request.getQuizId())
                .orElseThrow(() -> quizNotFound(request.getQuizId()));
        assertEnrolled(user.getId(), quiz.getLesson().getCourse().getId());
        LocalDateTime now = LocalDateTime.now();
        if (quiz.getStartAt() != null && now.isBefore(quiz.getStartAt())) {
            throw quizNotStarted(quiz.getStartAt());
        }
        if (quiz.getEndAt() != null && now.isAfter(quiz.getEndAt())) {
            throw quizClosed(quiz.getEndAt());
        }

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
        AssessmentAssignment assignment = assessmentAssignmentRepository.findByLesson_Id(lessonId)
                .orElseThrow(() -> assignmentNotFound(lessonId));
        LocalDateTime now = LocalDateTime.now();
        if (assignment.getStartAt() != null && now.isBefore(assignment.getStartAt())) {
            throw assignmentNotStarted(assignment.getStartAt());
        }
        if (assignment.getEndAt() != null && now.isAfter(assignment.getEndAt())) {
            throw assignmentClosed(assignment.getEndAt());
        }

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
    public InstructorAssignmentResponse getAssignmentByLessonForStudent(Long lessonId) {
        User user = currentUser();
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> lessonNotFound(lessonId));
        assertEnrolled(user.getId(), lesson.getCourse().getId());
        AssessmentAssignment assignment = assessmentAssignmentRepository.findByLesson_Id(lessonId)
                .orElseThrow(() -> assignmentNotFound(lessonId));
        return InstructorAssignmentResponse.from(assignment);
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
            rows.add(toInstructorSubmissionResponse(row));
        }

        List<AssignmentSubmission> assignmentSubmissions = assignmentSubmissionRepository
                .findByLesson_Course_Instructor_IdOrderBySubmittedAtDesc(current.getId());
        for (AssignmentSubmission row : assignmentSubmissions) {
            rows.add(toInstructorSubmissionResponse(row));
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
            return toInstructorSubmissionResponse(saved);
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
            return toInstructorSubmissionResponse(saved);
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
        boolean isAdmin = hasRole(auth, "ROLE_ADMIN");
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

    private boolean hasRole(Authentication auth, String role) {
        return auth != null
                && auth.getAuthorities() != null
                && auth.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .anyMatch(role::equals);
    }

    private AssessmentQuizResponse toStudentQuizResponse(AssessmentQuiz quiz) {
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
                quiz.getStartAt(),
                quiz.getEndAt(),
                questions);
    }

    private InstructorSubmissionItemResponse toInstructorSubmissionResponse(AssessmentQuizSubmission row) {
        return new InstructorSubmissionItemResponse(
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
                row.getGradedAt());
    }

    private InstructorSubmissionItemResponse toInstructorSubmissionResponse(AssignmentSubmission row) {
        return new InstructorSubmissionItemResponse(
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
                row.getGradedAt());
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

    // ---- Instructor quiz CRUD ----

    @Override
    @Transactional(readOnly = true)
    public InstructorQuizResponse getQuizByLesson(Long lessonId) {
        assertInstructorOrAdmin();
        AssessmentQuiz quiz = assessmentQuizRepository.findByLesson_Id(lessonId)
                .orElseThrow(() -> quizNotFound(lessonId));
        return toInstructorQuizResponse(quiz);
    }

    @Override
    @Transactional
    public InstructorQuizResponse createQuiz(InstructorQuizCreateRequest request) {
        assertInstructorOrAdmin();
        User me = currentUser();
        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> lessonNotFound(request.getLessonId()));
        assertCourseInstructor(lesson.getCourse().getInstructor(), me);

        if (assessmentQuizRepository.findByLesson_Id(lesson.getId()).isPresent()) {
            Map<String, String> errors = new HashMap<>();
            errors.put(ERR_CODE, "QUIZ_ALREADY_EXISTS");
            errors.put("lessonId", String.valueOf(lesson.getId()));
            throw new ApiBusinessException(HttpStatus.CONFLICT, new ErrorResource("Quiz already exists for this lesson", errors));
        }

        AssessmentQuiz quiz = new AssessmentQuiz();
        quiz.setLesson(lesson);
        quiz.setTitle(request.getTitle().trim());
        quiz.setDescription(request.getDescription());
        quiz.setPassScore(request.getPassScore() != null ? request.getPassScore() : 0);
        validateQuizWindow(request.getStartAt(), request.getEndAt());
        quiz.setStartAt(request.getStartAt());
        quiz.setEndAt(request.getEndAt());
        AssessmentQuiz saved = assessmentQuizRepository.save(quiz);
        return toInstructorQuizResponse(saved);
    }

    @Override
    @Transactional
    public InstructorQuizResponse updateQuiz(Long quizId, InstructorQuizUpdateRequest request) {
        assertInstructorOrAdmin();
        User me = currentUser();
        AssessmentQuiz quiz = assessmentQuizRepository.findById(quizId)
                .orElseThrow(() -> quizNotFound(quizId));
        assertCourseInstructor(quiz.getLesson().getCourse().getInstructor(), me);

        quiz.setTitle(request.getTitle().trim());
        quiz.setDescription(request.getDescription());
        quiz.setPassScore(request.getPassScore() != null ? request.getPassScore() : 0);
        validateQuizWindow(request.getStartAt(), request.getEndAt());
        quiz.setStartAt(request.getStartAt());
        quiz.setEndAt(request.getEndAt());
        AssessmentQuiz saved = assessmentQuizRepository.save(quiz);
        return toInstructorQuizResponse(saved);
    }

    @Override
    @Transactional
    public void deleteQuiz(Long quizId) {
        assertInstructorOrAdmin();
        User me = currentUser();
        AssessmentQuiz quiz = assessmentQuizRepository.findById(quizId)
                .orElseThrow(() -> quizNotFound(quizId));
        assertCourseInstructor(quiz.getLesson().getCourse().getInstructor(), me);
        List<Long> submissionIds = assessmentQuizSubmissionRepository.findByQuiz_Id(quizId).stream()
                .map(AssessmentQuizSubmission::getId)
                .collect(Collectors.toList());
        if (!submissionIds.isEmpty()) {
            assessmentQuizSubmissionAnswerRepository.deleteBySubmission_IdIn(submissionIds);
        }
        assessmentQuizSubmissionAnswerRepository.deleteByQuestion_Quiz_Id(quizId);
        assessmentQuizSubmissionRepository.deleteByQuiz_Id(quizId);
        assessmentQuizQuestionRepository.deleteAll(
                assessmentQuizQuestionRepository.findByQuiz_IdOrderByOrderIndexAsc(quizId));
        assessmentQuizRepository.delete(quiz);
    }

    @Override
    @Transactional
    public InstructorQuizResponse addQuestion(Long quizId, QuizQuestionRequest request) {
        assertInstructorOrAdmin();
        User me = currentUser();
        AssessmentQuiz quiz = assessmentQuizRepository.findById(quizId)
                .orElseThrow(() -> quizNotFound(quizId));
        assertCourseInstructor(quiz.getLesson().getCourse().getInstructor(), me);

        AssessmentQuizQuestion q = buildQuestion(quiz, request);
        assessmentQuizQuestionRepository.save(q);
        return toInstructorQuizResponse(quiz);
    }

    @Override
    @Transactional
    public InstructorQuizResponse updateQuestion(Long quizId, Long questionId, QuizQuestionRequest request) {
        assertInstructorOrAdmin();
        User me = currentUser();
        AssessmentQuiz quiz = assessmentQuizRepository.findById(quizId)
                .orElseThrow(() -> quizNotFound(quizId));
        assertCourseInstructor(quiz.getLesson().getCourse().getInstructor(), me);

        AssessmentQuizQuestion q = assessmentQuizQuestionRepository.findById(questionId)
                .orElseThrow(() -> questionNotFound(questionId));
        applyQuestionFields(q, request);
        assessmentQuizQuestionRepository.save(q);
        return toInstructorQuizResponse(quiz);
    }

    @Override
    @Transactional
    public InstructorQuizResponse deleteQuestion(Long quizId, Long questionId) {
        assertInstructorOrAdmin();
        User me = currentUser();
        AssessmentQuiz quiz = assessmentQuizRepository.findById(quizId)
                .orElseThrow(() -> quizNotFound(quizId));
        assertCourseInstructor(quiz.getLesson().getCourse().getInstructor(), me);

        AssessmentQuizQuestion q = assessmentQuizQuestionRepository.findById(questionId)
                .orElseThrow(() -> questionNotFound(questionId));
        assessmentQuizQuestionRepository.delete(q);
        return toInstructorQuizResponse(quiz);
    }

    private InstructorQuizResponse toInstructorQuizResponse(AssessmentQuiz quiz) {
        List<InstructorQuizResponse.QuizQuestionDetail> questions =
                assessmentQuizQuestionRepository.findByQuiz_IdOrderByOrderIndexAsc(quiz.getId())
                        .stream()
                        .map(q -> new InstructorQuizResponse.QuizQuestionDetail(
                                q.getId(),
                                q.getQuestionText(),
                                q.getOptionA(),
                                q.getOptionB(),
                                q.getOptionC(),
                                q.getOptionD(),
                                q.getCorrectOption(),
                                q.getPoint(),
                                q.getOrderIndex()))
                        .collect(Collectors.toList());
        return new InstructorQuizResponse(
                quiz.getId(),
                quiz.getLesson().getId(),
                quiz.getTitle(),
                quiz.getDescription(),
                quiz.getPassScore(),
                quiz.getStartAt(),
                quiz.getEndAt(),
                questions);
    }

    private AssessmentQuizQuestion buildQuestion(AssessmentQuiz quiz, QuizQuestionRequest request) {
        AssessmentQuizQuestion q = new AssessmentQuizQuestion();
        q.setQuiz(quiz);
        applyQuestionFields(q, request);
        return q;
    }

    private void applyQuestionFields(AssessmentQuizQuestion q, QuizQuestionRequest request) {
        q.setQuestionText(request.getQuestionText().trim());
        q.setOptionA(request.getOptionA().trim());
        q.setOptionB(request.getOptionB().trim());
        q.setOptionC(request.getOptionC().trim());
        q.setOptionD(request.getOptionD().trim());
        q.setCorrectOption(request.getCorrectOption());
        q.setPoint(request.getPoint());
        q.setOrderIndex(request.getOrderIndex());
    }

    private static ApiBusinessException questionNotFound(Long questionId) {
        Map<String, String> errors = new HashMap<>();
        errors.put(ERR_CODE, "QUESTION_NOT_FOUND");
        errors.put("questionId", String.valueOf(questionId));
        return new ApiBusinessException(HttpStatus.NOT_FOUND, new ErrorResource("Question not found", errors));
    }

    private static void validateQuizWindow(LocalDateTime startAt, LocalDateTime endAt) {
        if (startAt == null || endAt == null || !endAt.isAfter(startAt)) {
            Map<String, String> errors = new HashMap<>();
            errors.put(ERR_CODE, "INVALID_QUIZ_WINDOW");
            errors.put("message", "endAt must be after startAt");
            throw new ApiBusinessException(HttpStatus.BAD_REQUEST, new ErrorResource("Invalid quiz time window", errors));
        }
    }

    private static ApiBusinessException quizNotStarted(LocalDateTime startAt) {
        Map<String, String> errors = new HashMap<>();
        errors.put(ERR_CODE, "QUIZ_NOT_STARTED");
        errors.put("startAt", String.valueOf(startAt));
        return new ApiBusinessException(HttpStatus.BAD_REQUEST, new ErrorResource("Quiz has not started yet", errors));
    }

    private static ApiBusinessException quizClosed(LocalDateTime endAt) {
        Map<String, String> errors = new HashMap<>();
        errors.put(ERR_CODE, "QUIZ_CLOSED");
        errors.put("endAt", String.valueOf(endAt));
        return new ApiBusinessException(HttpStatus.BAD_REQUEST, new ErrorResource("Quiz deadline has passed", errors));
    }

    // ---- Instructor assignment CRUD ----

    @Override
    @Transactional(readOnly = true)
    public InstructorAssignmentResponse getAssignmentByLesson(Long lessonId) {
        assertInstructorOrAdmin();
        AssessmentAssignment assignment = assessmentAssignmentRepository.findByLesson_Id(lessonId)
                .orElseThrow(() -> assignmentNotFound(lessonId));
        return InstructorAssignmentResponse.from(assignment);
    }

    @Override
    @Transactional
    public InstructorAssignmentResponse createAssignment(InstructorAssignmentCreateRequest request) {
        assertInstructorOrAdmin();
        User me = currentUser();
        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> lessonNotFound(request.getLessonId()));
        assertCourseInstructor(lesson.getCourse().getInstructor(), me);

        if (assessmentAssignmentRepository.findByLesson_Id(lesson.getId()).isPresent()) {
            Map<String, String> errors = new HashMap<>();
            errors.put(ERR_CODE, "ASSIGNMENT_ALREADY_EXISTS");
            errors.put("lessonId", String.valueOf(lesson.getId()));
            throw new ApiBusinessException(HttpStatus.CONFLICT, new ErrorResource("Assignment already exists for this lesson", errors));
        }

        AssessmentAssignment assignment = new AssessmentAssignment();
        assignment.setLesson(lesson);
        assignment.setTitle(request.getTitle().trim());
        assignment.setDescription(request.getDescription());
        assignment.setMaxScore(request.getMaxScore());
        validateAssignmentWindow(request.getStartAt(), request.getEndAt());
        assignment.setStartAt(request.getStartAt());
        assignment.setEndAt(request.getEndAt());
        return InstructorAssignmentResponse.from(assessmentAssignmentRepository.save(assignment));
    }

    @Override
    @Transactional
    public InstructorAssignmentResponse updateAssignment(Long assignmentId, InstructorAssignmentUpdateRequest request) {
        assertInstructorOrAdmin();
        User me = currentUser();
        AssessmentAssignment assignment = assessmentAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> assignmentNotFound(assignmentId));
        assertCourseInstructor(assignment.getLesson().getCourse().getInstructor(), me);

        assignment.setTitle(request.getTitle().trim());
        assignment.setDescription(request.getDescription());
        assignment.setMaxScore(request.getMaxScore());
        validateAssignmentWindow(request.getStartAt(), request.getEndAt());
        assignment.setStartAt(request.getStartAt());
        assignment.setEndAt(request.getEndAt());
        return InstructorAssignmentResponse.from(assessmentAssignmentRepository.save(assignment));
    }

    @Override
    @Transactional
    public void deleteAssignment(Long assignmentId) {
        assertInstructorOrAdmin();
        User me = currentUser();
        AssessmentAssignment assignment = assessmentAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> assignmentNotFound(assignmentId));
        assertCourseInstructor(assignment.getLesson().getCourse().getInstructor(), me);
        assessmentAssignmentRepository.delete(assignment);
    }

    private static ApiBusinessException assignmentNotFound(Long id) {
        Map<String, String> errors = new HashMap<>();
        errors.put(ERR_CODE, "ASSIGNMENT_NOT_FOUND");
        errors.put("id", String.valueOf(id));
        return new ApiBusinessException(HttpStatus.NOT_FOUND, new ErrorResource("Assignment not found", errors));
    }

    private static void validateAssignmentWindow(LocalDateTime startAt, LocalDateTime endAt) {
        if (startAt == null || endAt == null || !endAt.isAfter(startAt)) {
            Map<String, String> errors = new HashMap<>();
            errors.put(ERR_CODE, "INVALID_ASSIGNMENT_WINDOW");
            errors.put("message", "endAt must be after startAt");
            throw new ApiBusinessException(HttpStatus.BAD_REQUEST, new ErrorResource("Invalid assignment time window", errors));
        }
    }

    private static ApiBusinessException assignmentNotStarted(LocalDateTime startAt) {
        Map<String, String> errors = new HashMap<>();
        errors.put(ERR_CODE, "ASSIGNMENT_NOT_STARTED");
        errors.put("startAt", String.valueOf(startAt));
        return new ApiBusinessException(HttpStatus.BAD_REQUEST, new ErrorResource("Assignment has not started yet", errors));
    }

    private static ApiBusinessException assignmentClosed(LocalDateTime endAt) {
        Map<String, String> errors = new HashMap<>();
        errors.put(ERR_CODE, "ASSIGNMENT_CLOSED");
        errors.put("endAt", String.valueOf(endAt));
        return new ApiBusinessException(HttpStatus.BAD_REQUEST, new ErrorResource("Assignment deadline has passed", errors));
    }
}

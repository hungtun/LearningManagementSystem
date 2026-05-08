package com.ou.LMS_Spring.Entities.seeds;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.ou.LMS_Spring.Entities.AssessmentAssignment;
import com.ou.LMS_Spring.Entities.AssessmentQuestionOption;
import com.ou.LMS_Spring.Entities.AssessmentQuiz;
import com.ou.LMS_Spring.Entities.AssessmentQuizQuestion;
import com.ou.LMS_Spring.Entities.AssessmentQuizSubmission;
import com.ou.LMS_Spring.Entities.AssessmentQuizSubmissionAnswer;
import com.ou.LMS_Spring.Entities.AssignmentSubmission;
import com.ou.LMS_Spring.Entities.Category;
import com.ou.LMS_Spring.Entities.Course;
import com.ou.LMS_Spring.Entities.CoursePublicationStatus;
import com.ou.LMS_Spring.Entities.CourseReview;
import com.ou.LMS_Spring.Entities.Enrollment;
import com.ou.LMS_Spring.Entities.EnrollmentStatus;
import com.ou.LMS_Spring.Entities.Lesson;
import com.ou.LMS_Spring.Entities.LessonAttachment;
import com.ou.LMS_Spring.Entities.LessonDiscussion;
import com.ou.LMS_Spring.Entities.LessonProgress;
import com.ou.LMS_Spring.Entities.LessonProgressStatus;
import com.ou.LMS_Spring.Entities.Notification;
import com.ou.LMS_Spring.Entities.Role;
import com.ou.LMS_Spring.Entities.User;
import com.ou.LMS_Spring.Entities.UserNotification;
import com.ou.LMS_Spring.modules.courses.repositories.CourseRepository;
import com.ou.LMS_Spring.modules.enrollments.repositories.EnrollmentRepository;
import com.ou.LMS_Spring.modules.users.repositories.UserRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Component
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true")
public class DbSeed implements CommandLineRunner {

    private static final String SAMPLE_PASSWORD = "123456";

    @PersistenceContext
    private EntityManager entityManager;

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public DbSeed(
            PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            CourseRepository courseRepository,
            EnrollmentRepository enrollmentRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        System.out.println("DbSeed: reset database and insert realistic sample data...");
        cleanupDatabase();

        String encodedPassword = passwordEncoder.encode(SAMPLE_PASSWORD);

        Role roleStudent = persistRole("STUDENT");
        Role roleInstructor = persistRole("INSTRUCTOR");
        Role roleAdmin = persistRole("ADMIN");

        Category catWeb = persistCategory("Web Development", "Frontend and backend development practices.");
        Category catData = persistCategory("Data & Analytics", "Data modeling, SQL, and business analytics.");
        Category catDesign = persistCategory("UX & Design", "User research and learning experience design.");

        userRepository.save(buildUser("admin@lms.local", encodedPassword, "System Admin", roleAdmin));
        User instructorJava = userRepository.save(buildUser("minh.tran@lms.local", encodedPassword, "Tran Minh", roleInstructor));
        User instructorData = userRepository.save(buildUser("lan.nguyen@lms.local", encodedPassword, "Nguyen Lan", roleInstructor));
        User studentAnh = userRepository.save(buildUser("anh.student@lms.local", encodedPassword, "Le Ngoc Anh", roleStudent));
        User studentBao = userRepository.save(buildUser("bao.student@lms.local", encodedPassword, "Pham Quoc Bao", roleStudent));
        User studentChi = userRepository.save(buildUser("chi.student@lms.local", encodedPassword, "Vo Thanh Chi", roleStudent));

        Course courseJava = saveCourse("Java Backend Fundamentals",
                "Build REST API with Java core, Spring Boot, and clean architecture practices.",
                catWeb, instructorJava, CoursePublicationStatus.PUBLISHED);
        Course courseReact = saveCourse("React Frontend for LMS",
                "Build LMS frontend with routing, auth flow, and reusable components.",
                catWeb, instructorJava, CoursePublicationStatus.PUBLISHED);
        Course courseSql = saveCourse("SQL for Product Analytics",
                "Write business queries, cohort metrics, and dashboard-ready datasets.",
                catData, instructorData, CoursePublicationStatus.PUBLISHED);
        Course courseUx = saveCourse("UX Research for Education Products",
                "Interview learners, map user journeys, and improve course completion UX.",
                catDesign, instructorData, CoursePublicationStatus.PENDING_REVIEW);

        Lesson javaLesson1 = persistLesson(courseJava, "Spring Boot Project Setup",
                "Setup Maven project, environment profiles, and package structure.", 1,
                "https://res.cloudinary.com/demo/video/upload/v1/lms/java-setup.mp4");
        Lesson javaLesson2 = persistLesson(courseJava, "Authentication with JWT",
                "Implement login, token generation, and request filtering.", 2,
                "https://res.cloudinary.com/demo/video/upload/v1/lms/jwt-auth.mp4");
        Lesson javaLesson3 = persistLesson(courseJava, "Global Exception Handling",
                "Design consistent error payloads with controller advice.", 3,
                "https://res.cloudinary.com/demo/video/upload/v1/lms/exception.mp4");

        Lesson reactLesson1 = persistLesson(courseReact, "React Router and Guarded Routes",
                "Create role-aware route guards for student and admin pages.", 1,
                "https://res.cloudinary.com/demo/video/upload/v1/lms/react-router.mp4");
        persistLesson(courseReact, "State and API Integration",
                "Fetch LMS APIs, manage loading states, and handle API errors.", 2,
                "https://res.cloudinary.com/demo/video/upload/v1/lms/react-api.mp4");

        Lesson sqlLesson1 = persistLesson(courseSql, "Analytics Schema Design",
                "Model enrollment and completion events for reporting use cases.", 1,
                "https://res.cloudinary.com/demo/video/upload/v1/lms/sql-schema.mp4");
        Lesson sqlLesson2 = persistLesson(courseSql, "KPI Query Patterns",
                "Use CTE and window functions for dashboard metrics.", 2,
                "https://res.cloudinary.com/demo/video/upload/v1/lms/sql-kpi.mp4");

        persistLesson(courseUx, "LMS User Interview Plan",
                "Draft interview script and recruit student participants.", 1,
                "https://res.cloudinary.com/demo/video/upload/v1/lms/ux-interview.mp4");
        persistLesson(courseUx, "Journey Mapping Workshop",
                "Map student pain points from onboarding to assignment submission.", 2,
                "https://res.cloudinary.com/demo/video/upload/v1/lms/journey-map.mp4");

        persistLessonAttachment(javaLesson2, "jwt-cheatsheet.pdf",
                "https://res.cloudinary.com/demo/raw/upload/v1/lms/jwt-cheatsheet.pdf",
                "application/pdf", 183245L);
        persistLessonAttachment(sqlLesson2, "kpi-query-template.sql",
                "https://res.cloudinary.com/demo/raw/upload/v1/lms/kpi-query-template.sql",
                "text/sql", 12780L);

        saveEnrollment(studentAnh, courseJava, EnrollmentStatus.ACTIVE, LocalDateTime.now().minusDays(10));
        saveEnrollment(studentAnh, courseReact, EnrollmentStatus.ACTIVE, LocalDateTime.now().minusDays(8));
        saveEnrollment(studentBao, courseJava, EnrollmentStatus.ACTIVE, LocalDateTime.now().minusDays(6));
        saveEnrollment(studentBao, courseSql, EnrollmentStatus.COMPLETED, LocalDateTime.now().minusDays(30));
        saveEnrollment(studentChi, courseSql, EnrollmentStatus.ACTIVE, LocalDateTime.now().minusDays(3));

        saveProgress(studentAnh, javaLesson1, LessonProgressStatus.COMPLETED, 100, LocalDateTime.now().minusDays(7));
        saveProgress(studentAnh, javaLesson2, LessonProgressStatus.IN_PROGRESS, 65, null);
        saveProgress(studentAnh, reactLesson1, LessonProgressStatus.IN_PROGRESS, 45, null);
        saveProgress(studentBao, javaLesson1, LessonProgressStatus.COMPLETED, 100, LocalDateTime.now().minusDays(5));
        saveProgress(studentBao, javaLesson2, LessonProgressStatus.COMPLETED, 100, LocalDateTime.now().minusDays(2));
        saveProgress(studentBao, javaLesson3, LessonProgressStatus.IN_PROGRESS, 50, null);
        saveProgress(studentChi, sqlLesson1, LessonProgressStatus.IN_PROGRESS, 70, null);
        saveProgress(studentChi, sqlLesson2, LessonProgressStatus.NOT_STARTED, 0, null);

        AssessmentQuiz javaQuiz = persistQuiz(
                javaLesson2,
                "JWT Security Quiz",
                "Check understanding of token structure and validation flow.",
                7,
                2,
                LocalDateTime.now().minusDays(14),
                LocalDateTime.now().plusDays(45));
        AssessmentQuizQuestion question1 = persistQuizQuestion(
                javaQuiz,
                "JWT consists of how many segments?",
                "2 segments",
                "3 segments",
                "4 segments",
                "5 segments",
                AssessmentQuestionOption.B,
                5,
                1);
        AssessmentQuizQuestion question2 = persistQuizQuestion(
                javaQuiz,
                "Where should server-side JWT signature be verified?",
                "Only at frontend",
                "At API gateway and backend filter",
                "Only when token expires",
                "In database trigger",
                AssessmentQuestionOption.B,
                5,
                2);

        AssessmentQuizSubmission submission = persistQuizSubmission(
                javaQuiz,
                studentBao,
                instructorJava,
                8,
                10,
                "Good understanding, review token refresh policy.",
                LocalDateTime.now().minusDays(1));
        persistSubmissionAnswer(submission, question1, AssessmentQuestionOption.B, true, 5);
        persistSubmissionAnswer(submission, question2, AssessmentQuestionOption.C, false, 3);

        AssessmentAssignment assignment = persistAssignment(
                javaLesson3,
                "Design Unified Error Response",
                "Implement global exception handler with validation and auth error mapping.",
                100,
                LocalDateTime.now().minusDays(7),
                LocalDateTime.now().plusDays(7));
        persistAssignmentSubmission(
                assignment,
                javaLesson3,
                studentAnh,
                instructorJava,
                90,
                "Great structure, add more error code constants.",
                LocalDateTime.now().minusDays(2));

        persistCourseReview(studentAnh, courseJava, 5,
                "Clear backend flow and practical coding examples.");
        persistCourseReview(studentBao, courseJava, 4,
                "Useful content, would be better with more unit test examples.");
        persistCourseReview(studentChi, courseSql, 5,
                "Excellent analytics examples with real business context.");

        LessonDiscussion parentDiscussion = persistLessonDiscussion(
                studentAnh,
                javaLesson2,
                "I am confused about access token and refresh token expiration settings.",
                null);
        persistLessonDiscussion(
                instructorJava,
                javaLesson2,
                "Use short-lived access token and rotate refresh token on each refresh request.",
                parentDiscussion);

        persistNotification("System maintenance", "LMS will be under maintenance Sunday 22:00 - 23:00.", true, null);
        persistNotification("Assignment reminder", "Please submit your exception handling assignment before deadline.",
                false, studentAnh);
        persistUserNotification(studentAnh, "Course update", "Java Backend Fundamentals has a new lesson attachment.");
        persistUserNotification(studentChi, "Quiz opened", "JWT Security Quiz is now available for attempt.");

        entityManager.flush();

        System.out.println("DbSeed completed with realistic sample data.");
        System.out.println("Sample logins (password for all: " + SAMPLE_PASSWORD + "):");
        System.out.println("  admin@lms.local");
        System.out.println("  minh.tran@lms.local");
        System.out.println("  lan.nguyen@lms.local");
        System.out.println("  anh.student@lms.local");
        System.out.println("  bao.student@lms.local");
        System.out.println("  chi.student@lms.local");
    }

    private Role persistRole(String name) {
        Role role = new Role();
        role.setName(name);
        entityManager.persist(role);
        return role;
    }

    private Category persistCategory(String name, String description) {
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        entityManager.persist(category);
        return category;
    }

    private User buildUser(String email, String passwordHash, String fullName, Role role) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordHash);
        user.setFullName(fullName);
        Set<Role> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);
        return user;
    }

    private Course saveCourse(
            String title,
            String description,
            Category category,
            User instructor,
            CoursePublicationStatus status) {
        Course course = new Course();
        course.setTitle(title);
        course.setDescription(description);
        course.setCategory(category);
        course.setInstructor(instructor);
        course.setPublicationStatus(status);
        return courseRepository.save(course);
    }

    private Lesson persistLesson(Course course, String title, String content, int orderIndex, String videoUrl) {
        Lesson lesson = new Lesson();
        lesson.setCourse(course);
        lesson.setTitle(title);
        lesson.setContent(content);
        lesson.setOrderIndex(orderIndex);
        lesson.setVideoUrl(videoUrl);
        entityManager.persist(lesson);
        return lesson;
    }

    private void persistLessonAttachment(Lesson lesson, String fileName, String fileUrl, String fileType, Long fileSize) {
        LessonAttachment attachment = new LessonAttachment();
        attachment.setLesson(lesson);
        attachment.setFileName(fileName);
        attachment.setFileUrl(fileUrl);
        attachment.setFileType(fileType);
        attachment.setFileSize(fileSize);
        entityManager.persist(attachment);
    }

    private void saveEnrollment(User user, Course course, EnrollmentStatus status, LocalDateTime enrolledAt) {
        Enrollment enrollment = new Enrollment();
        enrollment.setUser(user);
        enrollment.setCourse(course);
        enrollment.setStatus(status);
        enrollment.setEnrolledAt(enrolledAt);
        enrollmentRepository.save(enrollment);
    }

    private void saveProgress(
            User user,
            Lesson lesson,
            LessonProgressStatus status,
            int progressPercent,
            LocalDateTime completedAt) {
        LessonProgress progress = new LessonProgress();
        progress.setUser(user);
        progress.setLesson(lesson);
        progress.setStatus(status);
        progress.setProgressPercent(progressPercent);
        progress.setCompletedAt(completedAt);
        entityManager.persist(progress);
    }

    private AssessmentQuiz persistQuiz(
            Lesson lesson,
            String title,
            String description,
            int passScore,
            int maxAttempts,
            LocalDateTime startAt,
            LocalDateTime endAt) {
        AssessmentQuiz quiz = new AssessmentQuiz();
        quiz.setLesson(lesson);
        quiz.setTitle(title);
        quiz.setDescription(description);
        quiz.setPassScore(passScore);
        quiz.setMaxAttempts(maxAttempts);
        quiz.setStartAt(startAt);
        quiz.setEndAt(endAt);
        entityManager.persist(quiz);
        return quiz;
    }

    private AssessmentQuizQuestion persistQuizQuestion(
            AssessmentQuiz quiz,
            String questionText,
            String optionA,
            String optionB,
            String optionC,
            String optionD,
            AssessmentQuestionOption correctOption,
            int point,
            int orderIndex) {
        AssessmentQuizQuestion question = new AssessmentQuizQuestion();
        question.setQuiz(quiz);
        question.setQuestionText(questionText);
        question.setOptionA(optionA);
        question.setOptionB(optionB);
        question.setOptionC(optionC);
        question.setOptionD(optionD);
        question.setCorrectOption(correctOption);
        question.setPoint(point);
        question.setOrderIndex(orderIndex);
        entityManager.persist(question);
        return question;
    }

    private AssessmentQuizSubmission persistQuizSubmission(
            AssessmentQuiz quiz,
            User student,
            User gradedBy,
            int score,
            int maxScore,
            String feedback,
            LocalDateTime submittedAt) {
        AssessmentQuizSubmission submission = new AssessmentQuizSubmission();
        submission.setQuiz(quiz);
        submission.setStudent(student);
        submission.setScore(score);
        submission.setMaxScore(maxScore);
        submission.setFeedback(feedback);
        submission.setGradedAt(submittedAt.plusHours(8));
        submission.setGradedBy(gradedBy);
        submission.setSubmittedAt(submittedAt);
        entityManager.persist(submission);
        return submission;
    }

    private void persistSubmissionAnswer(
            AssessmentQuizSubmission submission,
            AssessmentQuizQuestion question,
            AssessmentQuestionOption selectedOption,
            boolean correct,
            int earnedPoint) {
        AssessmentQuizSubmissionAnswer answer = new AssessmentQuizSubmissionAnswer();
        answer.setSubmission(submission);
        answer.setQuestion(question);
        answer.setSelectedOption(selectedOption);
        answer.setCorrect(correct);
        answer.setEarnedPoint(earnedPoint);
        entityManager.persist(answer);
    }

    private AssessmentAssignment persistAssignment(
            Lesson lesson,
            String title,
            String description,
            int maxScore,
            LocalDateTime startAt,
            LocalDateTime endAt) {
        AssessmentAssignment assignment = new AssessmentAssignment();
        assignment.setLesson(lesson);
        assignment.setTitle(title);
        assignment.setDescription(description);
        assignment.setMaxScore(maxScore);
        assignment.setStartAt(startAt);
        assignment.setEndAt(endAt);
        entityManager.persist(assignment);
        return assignment;
    }

    private void persistAssignmentSubmission(
            AssessmentAssignment assignment,
            Lesson lesson,
            User student,
            User gradedBy,
            Integer score,
            String feedback,
            LocalDateTime submittedAt) {
        AssignmentSubmission submission = new AssignmentSubmission();
        submission.setLesson(lesson);
        submission.setStudent(student);
        submission.setFilePath("uploads/assignments/" + assignment.getId() + "/solution-" + student.getId() + ".pdf");
        submission.setOriginalFilename("exception-handler-design.pdf");
        submission.setNote("Submitted architecture notes and API error examples.");
        submission.setScore(score);
        submission.setFeedback(feedback);
        submission.setGradedAt(submittedAt.plusHours(12));
        submission.setGradedBy(gradedBy);
        submission.setSubmittedAt(submittedAt);
        entityManager.persist(submission);
    }

    private void persistCourseReview(User user, Course course, int rating, String comment) {
        CourseReview review = new CourseReview();
        review.setUser(user);
        review.setCourse(course);
        review.setRating(rating);
        review.setComment(comment);
        entityManager.persist(review);
    }

    private LessonDiscussion persistLessonDiscussion(User user, Lesson lesson, String content, LessonDiscussion parent) {
        LessonDiscussion discussion = new LessonDiscussion();
        discussion.setUser(user);
        discussion.setLesson(lesson);
        discussion.setContent(content);
        discussion.setParent(parent);
        entityManager.persist(discussion);
        return discussion;
    }

    private void persistNotification(String title, String content, boolean broadcast, User recipient) {
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setContent(content);
        notification.setBroadcast(broadcast);
        notification.setRecipient(recipient);
        entityManager.persist(notification);
    }

    private void persistUserNotification(User user, String title, String content) {
        UserNotification notification = new UserNotification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setContent(content);
        entityManager.persist(notification);
    }

    private void cleanupDatabase() {
        entityManager.createNativeQuery("DELETE FROM assessment_quiz_submission_answers").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM assessment_quiz_submissions").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM assessment_quiz_questions").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM assessment_quizzes").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM assignment_submissions").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM assessment_assignments").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM lesson_discussions").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM lesson_attachments").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM lesson_progress").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM course_reviews").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM enrollments").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM notifications").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM user_notifications").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM blacklisted_tokens").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM lessons").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM courses").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM user_roles").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM users").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM categories").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM roles").executeUpdate();
    }
}

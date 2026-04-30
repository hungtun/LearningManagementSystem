package com.ou.LMS_Spring.modules.learnings.services.impl;

import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.imageio.ImageIO;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.ou.LMS_Spring.Entities.Course;
import com.ou.LMS_Spring.Entities.CourseReview;
import com.ou.LMS_Spring.Entities.Lesson;
import com.ou.LMS_Spring.Entities.LessonDiscussion;
import com.ou.LMS_Spring.Entities.LessonProgress;
import com.ou.LMS_Spring.Entities.LessonProgressStatus;
import com.ou.LMS_Spring.Entities.Role;
import com.ou.LMS_Spring.Entities.User;
import com.ou.LMS_Spring.helpers.ApiBusinessException;
import com.ou.LMS_Spring.modules.courses.repositories.CourseRepository;
import com.ou.LMS_Spring.modules.courses.repositories.LessonRepository;
import com.ou.LMS_Spring.modules.enrollments.repositories.EnrollmentRepository;
import com.ou.LMS_Spring.modules.learnings.dtos.CertificateDownload;
import com.ou.LMS_Spring.modules.learnings.dtos.requests.DiscussionCreateRequest;
import com.ou.LMS_Spring.modules.learnings.dtos.requests.ReviewCreateRequest;
import com.ou.LMS_Spring.modules.learnings.dtos.requests.VideoProgressPatchRequest;
import com.ou.LMS_Spring.modules.learnings.dtos.responses.CourseProgressResponse;
import com.ou.LMS_Spring.modules.learnings.dtos.responses.DiscussionResponse;
import com.ou.LMS_Spring.modules.learnings.dtos.responses.ReviewResponse;
import com.ou.LMS_Spring.modules.learnings.dtos.responses.VideoProgressResponse;
import com.ou.LMS_Spring.modules.learnings.repositories.CourseReviewRepository;
import com.ou.LMS_Spring.modules.learnings.repositories.LessonDiscussionRepository;
import com.ou.LMS_Spring.modules.learnings.repositories.LessonProgressRepository;
import com.ou.LMS_Spring.modules.learnings.services.interfaces.ILearningService;
import com.ou.LMS_Spring.modules.users.repositories.UserRepository;
import com.ou.LMS_Spring.resources.ErrorResource;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LearningService implements ILearningService {

    private static final String ERR_CODE = "code";

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final LessonDiscussionRepository lessonDiscussionRepository;
    private final CourseReviewRepository courseReviewRepository;

    @Override
    @Transactional
    public VideoProgressResponse patchVideoProgress(VideoProgressPatchRequest request) {
        User user = currentUser();
        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> lessonNotFound(request.getLessonId()));
        Long courseId = lesson.getCourse().getId();
        assertEnrolled(user.getId(), courseId);

        int pct = Math.min(100, Math.max(0, request.getProgressPercent()));
        LessonProgress progress = lessonProgressRepository.findByUser_IdAndLesson_Id(user.getId(), lesson.getId())
                .orElseGet(() -> {
                    LessonProgress p = new LessonProgress();
                    p.setUser(user);
                    p.setLesson(lesson);
                    return p;
                });

        progress.setProgressPercent(pct);
        if (pct >= 100) {
            progress.setStatus(LessonProgressStatus.COMPLETED);
            progress.setCompletedAt(LocalDateTime.now());
        } else if (pct > 0) {
            progress.setStatus(LessonProgressStatus.IN_PROGRESS);
            progress.setCompletedAt(null);
        } else {
            progress.setStatus(LessonProgressStatus.NOT_STARTED);
            progress.setCompletedAt(null);
        }

        LessonProgress saved = lessonProgressRepository.save(progress);
        return new VideoProgressResponse(
                lesson.getId(),
                saved.getProgressPercent(),
                saved.getStatus(),
                saved.getCompletedAt());
    }

    @Override
    @Transactional(readOnly = true)
    public CourseProgressResponse getCourseProgress(Long courseId) {
        User user = currentUser();
        assertEnrolled(user.getId(), courseId);
        courseRepository.findById(courseId).orElseThrow(() -> courseNotFound(courseId));

        List<Lesson> lessons = lessonRepository.findByCourse_IdOrderByOrderIndexAsc(courseId);
        int total = lessons.size();
        if (total == 0) {
            return new CourseProgressResponse(courseId, 0.0, 0, 0);
        }

        Map<Long, LessonProgress> byLessonId = lessonProgressRepository
                .findByUser_IdAndLesson_Course_Id(user.getId(), courseId)
                .stream()
                .collect(Collectors.toMap(p -> p.getLesson().getId(), p -> p, (a, b) -> a));

        double sumPercent = 0.0;
        int completed = 0;
        for (Lesson lesson : lessons) {
            LessonProgress p = byLessonId.get(lesson.getId());
            int lessonPct = p == null ? 0 : Math.min(100, Math.max(0, p.getProgressPercent()));
            sumPercent += lessonPct;
            if (lessonPct >= 100
                    || (p != null && p.getStatus() == LessonProgressStatus.COMPLETED)) {
                completed++;
            }
        }

        double completionPercent = Math.round(sumPercent * 10.0 / total) / 10.0;
        return new CourseProgressResponse(courseId, completionPercent, completed, total);
    }

    @Override
    @Transactional
    public DiscussionResponse createDiscussion(DiscussionCreateRequest request) {
        User user = currentUser();
        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> lessonNotFound(request.getLessonId()));
        if (!canParticipateInDiscussion(user, lesson)) {
            throw notEnrolled();
        }

        LessonDiscussion row = new LessonDiscussion();
        row.setUser(user);
        row.setLesson(lesson);
        row.setContent(request.getContent().trim());

        // Handle reply threading (max 1 level deep)
        if (request.getParentId() != null) {
            LessonDiscussion parent = lessonDiscussionRepository.findById(request.getParentId())
                    .orElseThrow(() -> discussionNotFound(request.getParentId()));
            // Ensure the parent belongs to the same lesson and is a root discussion
            if (!parent.getLesson().getId().equals(lesson.getId())) {
                throw parentDiscussionMismatch();
            }
            if (parent.getParent() != null) {
                throw replyDepthExceeded();
            }
            row.setParent(parent);
        }

        LessonDiscussion saved = lessonDiscussionRepository.save(row);
        DiscussionResponse response = toDiscussionResponse(saved);
        response.setReplies(java.util.Collections.emptyList());
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DiscussionResponse> listDiscussions(Long lessonId) {
        User user = currentUser();
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> lessonNotFound(lessonId));
        if (!canParticipateInDiscussion(user, lesson)) {
            throw notEnrolled();
        }

        // Fetch root discussions and their replies separately for clean threading
        List<LessonDiscussion> roots = lessonDiscussionRepository
                .findByLesson_IdAndParentIsNullOrderByCreatedAtAsc(lessonId);

        return roots.stream().map(root -> {
            DiscussionResponse r = toDiscussionResponse(root);
            List<DiscussionResponse> replies = lessonDiscussionRepository
                    .findByParent_IdOrderByCreatedAtAsc(root.getId())
                    .stream()
                    .map(reply -> {
                        DiscussionResponse rd = toDiscussionResponse(reply);
                        rd.setReplies(java.util.Collections.emptyList());
                        return rd;
                    })
                    .collect(Collectors.toList());
            r.setReplies(replies);
            return r;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ReviewResponse createReview(ReviewCreateRequest request) {
        User user = currentUser();
        Long courseId = request.getCourseId();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> courseNotFound(courseId));
        assertEnrolled(user.getId(), courseId);

        if (courseReviewRepository.existsByUser_IdAndCourse_Id(user.getId(), courseId)) {
            throw reviewAlreadyExists();
        }

        CourseReview review = new CourseReview();
        review.setUser(user);
        review.setCourse(course);
        review.setRating(request.getRating());
        String comment = request.getComment();
        review.setComment(comment != null && !comment.isBlank() ? comment.trim() : null);

        CourseReview saved = courseReviewRepository.save(review);
        return new ReviewResponse(
                saved.getId(),
                course.getId(),
                user.getId(),
                saved.getRating(),
                saved.getComment(),
                saved.getCreatedAt());
    }

    @Override
    @Transactional(readOnly = true)
    public CertificateDownload downloadCertificate(Long courseId, String format) {
        User user = currentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> courseNotFound(courseId));
        assertEnrolled(user.getId(), courseId);

        List<Lesson> lessons = lessonRepository.findByCourse_IdOrderByOrderIndexAsc(courseId);
        if (lessons.isEmpty()) {
            throw noLessonsInCourse();
        }
        if (!isCourseFullyCompleted(user.getId(), courseId, lessons)) {
            throw courseNotCompleted();
        }

        String fmt = format == null || format.isBlank() ? "pdf" : format.trim().toLowerCase();
        if ("png".equals(fmt)) {
            byte[] body = buildCertificatePng(user, course);
            return new CertificateDownload(body, "certificate-" + courseId + ".png", MediaType.IMAGE_PNG);
        }
        byte[] body = buildCertificatePdf(user, course);
        return new CertificateDownload(body, "certificate-" + courseId + ".pdf", MediaType.APPLICATION_PDF);
    }

    private boolean isCourseFullyCompleted(Long userId, Long courseId, List<Lesson> lessons) {
        Map<Long, LessonProgress> byLessonId = lessonProgressRepository
                .findByUser_IdAndLesson_Course_Id(userId, courseId)
                .stream()
                .collect(Collectors.toMap(p -> p.getLesson().getId(), p -> p, (a, b) -> a));

        for (Lesson lesson : lessons) {
            LessonProgress p = byLessonId.get(lesson.getId());
            boolean done = p != null
                    && (p.getStatus() == LessonProgressStatus.COMPLETED || p.getProgressPercent() >= 100);
            if (!done) {
                return false;
            }
        }
        return true;
    }

    private byte[] buildCertificatePdf(User user, Course course) {
        try {
            Document document = new Document();
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, baos);
            document.open();

            Paragraph title = new Paragraph(
                    "Certificate of Completion",
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22));
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            Paragraph line1 = new Paragraph("This certifies that", FontFactory.getFont(FontFactory.HELVETICA, 14));
            line1.setAlignment(Element.ALIGN_CENTER);
            document.add(line1);

            Paragraph name = new Paragraph(user.getFullName(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16));
            name.setAlignment(Element.ALIGN_CENTER);
            document.add(name);

            Paragraph line2 = new Paragraph("has completed the course", FontFactory.getFont(FontFactory.HELVETICA, 14));
            line2.setAlignment(Element.ALIGN_CENTER);
            document.add(line2);

            Paragraph courseTitle = new Paragraph(course.getTitle(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 15));
            courseTitle.setAlignment(Element.ALIGN_CENTER);
            document.add(courseTitle);

            document.add(new Paragraph(" "));
            String dateStr = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
            Paragraph dateLine = new Paragraph("Issued on " + dateStr, FontFactory.getFont(FontFactory.HELVETICA, 12));
            dateLine.setAlignment(Element.ALIGN_CENTER);
            document.add(dateLine);

            document.close();
            return baos.toByteArray();
        } catch (DocumentException e) {
            throw certificateBuildFailed(e);
        }
    }

    private byte[] buildCertificatePng(User user, Course course) {
        int width = 900;
        int height = 600;
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, width, height);
        g.setColor(Color.BLACK);
        g.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 36));
        drawCenteredString(g, "Certificate of Completion", width, 120);
        g.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 20));
        drawCenteredString(g, "This certifies that", width, 200);
        g.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 28));
        drawCenteredString(g, user.getFullName(), width, 260);
        g.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 20));
        drawCenteredString(g, "has completed the course", width, 320);
        g.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 22));
        drawCenteredString(g, truncate(course.getTitle(), 60), width, 380);
        g.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 16));
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
        drawCenteredString(g, "Issued on " + dateStr, width, 480);
        g.dispose();
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "png", baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw certificateBuildFailed(e);
        }
    }

    private static void drawCenteredString(Graphics2D g, String text, int width, int y) {
        int stringLen = g.getFontMetrics().stringWidth(text);
        int x = (width - stringLen) / 2;
        g.drawString(text, x, y);
    }

    private static String truncate(String s, int maxLen) {
        if (s == null) {
            return "";
        }
        if (s.length() <= maxLen) {
            return s;
        }
        return s.substring(0, maxLen - 3) + "...";
    }

    private DiscussionResponse toDiscussionResponse(LessonDiscussion d) {
        User u = d.getUser();
        DiscussionResponse r = new DiscussionResponse();
        r.setId(d.getId());
        r.setUserId(u.getId());
        r.setUserFullName(u.getFullName());
        r.setUserRole(resolveUserRole(u));
        r.setLessonId(d.getLesson().getId());
        r.setParentId(d.getParent() != null ? d.getParent().getId() : null);
        r.setContent(d.getContent());
        r.setCreatedAt(d.getCreatedAt());
        return r;
    }

    // Determine the highest-priority role name for display purposes
    private String resolveUserRole(User user) {
        java.util.Set<String> names = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
        if (names.contains("ADMIN")) return "ADMIN";
        if (names.contains("INSTRUCTOR")) return "INSTRUCTOR";
        return "STUDENT";
    }

    // Allow enrolled students, the course instructor, or any admin to participate
    private boolean canParticipateInDiscussion(User user, Lesson lesson) {
        boolean isAdmin = user.getRoles().stream().anyMatch(r -> "ADMIN".equals(r.getName()));
        if (isAdmin) return true;
        Course course = lesson.getCourse();
        boolean isInstructor = course.getInstructor() != null
                && course.getInstructor().getId().equals(user.getId());
        if (isInstructor) return true;
        return enrollmentRepository.existsByUser_IdAndCourse_Id(user.getId(), course.getId());
    }

    private void assertEnrolled(Long userId, Long courseId) {
        if (!enrollmentRepository.existsByUser_IdAndCourse_Id(userId, courseId)) {
            throw notEnrolled();
        }
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    private static ApiBusinessException courseNotFound(Long courseId) {
        Map<String, String> errors = new HashMap<>();
        errors.put(ERR_CODE, "COURSE_NOT_FOUND");
        errors.put("courseId", String.valueOf(courseId));
        return new ApiBusinessException(HttpStatus.NOT_FOUND, new ErrorResource("Course not found", errors));
    }

    private static ApiBusinessException lessonNotFound(Long lessonId) {
        Map<String, String> errors = new HashMap<>();
        errors.put(ERR_CODE, "LESSON_NOT_FOUND");
        errors.put("lessonId", String.valueOf(lessonId));
        return new ApiBusinessException(HttpStatus.NOT_FOUND, new ErrorResource("Lesson not found", errors));
    }

    private static ApiBusinessException notEnrolled() {
        Map<String, String> errors = new HashMap<>();
        errors.put(ERR_CODE, "NOT_ENROLLED");
        errors.put("message", "You must be enrolled in this course");
        return new ApiBusinessException(HttpStatus.FORBIDDEN, new ErrorResource("Not enrolled", errors));
    }

    private static ApiBusinessException reviewAlreadyExists() {
        Map<String, String> errors = new HashMap<>();
        errors.put(ERR_CODE, "REVIEW_ALREADY_EXISTS");
        errors.put("message", "You have already reviewed this course");
        return new ApiBusinessException(HttpStatus.CONFLICT, new ErrorResource("Review already exists", errors));
    }

    private static ApiBusinessException noLessonsInCourse() {
        Map<String, String> errors = new HashMap<>();
        errors.put(ERR_CODE, "NO_LESSONS_IN_COURSE");
        errors.put("message", "This course has no lessons yet");
        return new ApiBusinessException(HttpStatus.BAD_REQUEST, new ErrorResource("No lessons in course", errors));
    }

    private static ApiBusinessException courseNotCompleted() {
        Map<String, String> errors = new HashMap<>();
        errors.put(ERR_CODE, "COURSE_NOT_COMPLETED");
        errors.put("message", "Complete all lessons to receive a certificate");
        return new ApiBusinessException(HttpStatus.BAD_REQUEST, new ErrorResource("Course not completed", errors));
    }

    private static ApiBusinessException discussionNotFound(Long discussionId) {
        Map<String, String> errors = new HashMap<>();
        errors.put(ERR_CODE, "DISCUSSION_NOT_FOUND");
        errors.put("discussionId", String.valueOf(discussionId));
        return new ApiBusinessException(HttpStatus.NOT_FOUND, new ErrorResource("Discussion not found", errors));
    }

    private static ApiBusinessException parentDiscussionMismatch() {
        Map<String, String> errors = new HashMap<>();
        errors.put(ERR_CODE, "PARENT_DISCUSSION_MISMATCH");
        errors.put("message", "Parent discussion does not belong to the same lesson");
        return new ApiBusinessException(HttpStatus.BAD_REQUEST, new ErrorResource("Parent discussion mismatch", errors));
    }

    private static ApiBusinessException replyDepthExceeded() {
        Map<String, String> errors = new HashMap<>();
        errors.put(ERR_CODE, "REPLY_DEPTH_EXCEEDED");
        errors.put("message", "Cannot reply to a reply - only 1 level of threading is supported");
        return new ApiBusinessException(HttpStatus.BAD_REQUEST, new ErrorResource("Reply depth exceeded", errors));
    }

    private static ApiBusinessException certificateBuildFailed(Exception cause) {
        Map<String, String> errors = new HashMap<>();
        errors.put(ERR_CODE, "CERTIFICATE_BUILD_FAILED");
        errors.put("message", Optional.ofNullable(cause.getMessage()).orElse("Could not build certificate"));
        return new ApiBusinessException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                new ErrorResource("Certificate build failed", errors));
    }
}

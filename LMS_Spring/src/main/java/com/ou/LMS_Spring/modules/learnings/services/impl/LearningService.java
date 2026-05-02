package com.ou.LMS_Spring.modules.learnings.services.impl;

import java.awt.Color;
import java.awt.Font;
import java.awt.FontFormatException;
import java.awt.Graphics2D;
import java.awt.GradientPaint;
import java.awt.RenderingHints;
import java.awt.BasicStroke;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.imageio.ImageIO;

import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfWriter;
import com.ou.LMS_Spring.Entities.Course;
import com.ou.LMS_Spring.Entities.CourseReview;
import com.ou.LMS_Spring.Entities.Lesson;
import com.ou.LMS_Spring.Entities.LessonDiscussion;
import com.ou.LMS_Spring.Entities.LessonProgress;
import com.ou.LMS_Spring.Entities.LessonProgressStatus;
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
import com.ou.LMS_Spring.modules.learnings.dtos.responses.LessonProgressItemResponse;
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

    private static volatile Font cachedNotoSansAwtBase;

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

        int pct = normalizePercent(request.getProgressPercent());
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
        assertCourseExists(courseId);

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
            int lessonPct = p == null ? 0 : normalizePercent(p.getProgressPercent());
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
    @Transactional(readOnly = true)
    public List<LessonProgressItemResponse> getLessonProgresses(Long courseId) {
        User user = currentUser();
        assertEnrolled(user.getId(), courseId);
        assertCourseExists(courseId);

        return lessonProgressRepository.findByUser_IdAndLesson_Course_Id(user.getId(), courseId).stream()
                .map(progress -> new LessonProgressItemResponse(
                        progress.getLesson().getId(),
                        normalizePercent(progress.getProgressPercent()),
                        progress.getStatus()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DiscussionResponse createDiscussion(DiscussionCreateRequest request) {
        User user = currentUser();
        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> lessonNotFound(request.getLessonId()));
        Long courseId = lesson.getCourse().getId();
        assertEnrolledOrInstructor(user, courseId);

        LessonDiscussion row = new LessonDiscussion();
        row.setUser(user);
        row.setLesson(lesson);
        row.setContent(request.getContent().trim());

        if (request.getParentId() != null) {
            LessonDiscussion parent = lessonDiscussionRepository.findById(request.getParentId())
                    .orElseThrow(() -> discussionNotFound(request.getParentId()));
            if (!parent.getLesson().getId().equals(lesson.getId())) {
                throw new ApiBusinessException(
                        org.springframework.http.HttpStatus.BAD_REQUEST,
                        new ErrorResource("Parent discussion is not in this lesson", Map.of(ERR_CODE, "INVALID_PARENT")));
            }
            row.setParent(parent);
        }

        LessonDiscussion saved = lessonDiscussionRepository.save(row);
        return toDiscussionResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DiscussionResponse> listDiscussions(Long lessonId) {
        User user = currentUser();
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> lessonNotFound(lessonId));
        assertEnrolledOrInstructor(user, lesson.getCourse().getId());

        return lessonDiscussionRepository.findByLesson_IdAndParentIsNullOrderByCreatedAtAsc(lessonId).stream()
                .map(this::toDiscussionResponseTree)
                .collect(Collectors.toList());
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
                user.getFullName(),
                saved.getRating(),
                saved.getComment(),
                saved.getCreatedAt());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> listCourseReviews(Long courseId) {
        assertCourseExists(courseId);
        return courseReviewRepository.findByCourse_IdOrderByCreatedAtDesc(courseId).stream()
                .map(this::toReviewResponse)
                .collect(Collectors.toList());
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

    private static synchronized Font loadNotoSansAwtBaseOnce() throws IOException, FontFormatException {
        if (cachedNotoSansAwtBase != null) {
            return cachedNotoSansAwtBase;
        }
        ClassPathResource res = new ClassPathResource("fonts/NotoSans-Regular.ttf");
        try (InputStream in = res.getInputStream()) {
            Font f = Font.createFont(Font.TRUETYPE_FONT, in);
            java.awt.GraphicsEnvironment.getLocalGraphicsEnvironment().registerFont(f);
            cachedNotoSansAwtBase = f;
            return f;
        }
    }

    private Font notoSansAwtDerived(int style, float size) {
        try {
            return loadNotoSansAwtBaseOnce().deriveFont(style, size);
        } catch (IOException | FontFormatException e) {
            int awtStyle = (style & Font.BOLD) != 0 ? Font.BOLD : Font.PLAIN;
            return new Font(Font.SANS_SERIF, awtStyle, Math.max(1, Math.round(size)));
        }
    }

    private BaseFont certificatePdfBaseFont() {
        try {
            ClassPathResource res = new ClassPathResource("fonts/NotoSans-Regular.ttf");
            byte[] bytes = res.getContentAsByteArray();
            return BaseFont.createFont("NotoSans-Regular.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED, true, bytes, null);
        } catch (Exception e) {
            throw certificateBuildFailed(e);
        }
    }

    private static com.lowagie.text.Font pdfFont(BaseFont bf, float size, int style, Color color) {
        return new com.lowagie.text.Font(bf, size, style, color);
    }

    private byte[] buildCertificatePdf(User user, Course course) {
        try {
            BaseFont bf = certificatePdfBaseFont();
            Document document = new Document(PageSize.A4, 48, 48, 48, 48);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = PdfWriter.getInstance(document, baos);
            document.open();

            drawPdfCertificateFrame(writer);

            document.add(new Paragraph(" "));
            Paragraph title = new Paragraph(
                    "Certificate of Completion",
                    pdfFont(bf, 30, com.lowagie.text.Font.BOLD, new Color(15, 23, 42)));
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            Paragraph subtitle = new Paragraph(
                    "This certificate is proudly presented to",
                    pdfFont(bf, 13, com.lowagie.text.Font.NORMAL, new Color(71, 85, 105)));
            subtitle.setAlignment(Element.ALIGN_CENTER);
            document.add(subtitle);
            document.add(new Paragraph(" "));

            Paragraph name = new Paragraph(
                    user.getFullName(),
                    pdfFont(bf, 28, com.lowagie.text.Font.BOLD, new Color(30, 64, 175)));
            name.setAlignment(Element.ALIGN_CENTER);
            document.add(name);
            document.add(new Paragraph(" "));

            Paragraph line2 = new Paragraph(
                    "for successfully completing the course",
                    pdfFont(bf, 13, com.lowagie.text.Font.NORMAL, new Color(71, 85, 105)));
            line2.setAlignment(Element.ALIGN_CENTER);
            document.add(line2);
            document.add(new Paragraph(" "));

            Paragraph courseTitle = new Paragraph(
                    "\"" + course.getTitle() + "\"",
                    pdfFont(bf, 20, com.lowagie.text.Font.BOLD, new Color(15, 23, 42)));
            courseTitle.setAlignment(Element.ALIGN_CENTER);
            document.add(courseTitle);

            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));
            String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

            Paragraph dateLine = new Paragraph(
                    "Issued on " + dateStr,
                    pdfFont(bf, 12, com.lowagie.text.Font.NORMAL, new Color(51, 65, 85)));
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

        GradientPaint bg = new GradientPaint(0, 0, new Color(248, 250, 252), width, height, new Color(226, 232, 240));
        g.setPaint(bg);
        g.fillRect(0, 0, width, height);

        g.setColor(new Color(30, 64, 175));
        g.setStroke(new BasicStroke(4f));
        g.drawRoundRect(22, 22, width - 44, height - 44, 28, 28);
        g.setColor(new Color(191, 219, 254));
        g.setStroke(new BasicStroke(1.5f));
        g.drawRoundRect(34, 34, width - 68, height - 68, 24, 24);

        g.setColor(new Color(15, 23, 42));
        g.setFont(notoSansAwtDerived(Font.BOLD, 40f));
        drawCenteredString(g, "Certificate of Completion", width, 120);

        g.setColor(new Color(71, 85, 105));
        g.setFont(notoSansAwtDerived(Font.PLAIN, 20f));
        drawCenteredString(g, "This certificate is proudly presented to", width, 185);

        g.setColor(new Color(30, 64, 175));
        g.setFont(notoSansAwtDerived(Font.BOLD, 34f));
        drawCenteredString(g, truncate(user.getFullName(), 42), width, 250);

        g.setColor(new Color(71, 85, 105));
        g.setFont(notoSansAwtDerived(Font.PLAIN, 20f));
        drawCenteredString(g, "for successfully completing the course", width, 312);

        g.setColor(new Color(15, 23, 42));
        g.setFont(notoSansAwtDerived(Font.BOLD, 24f));
        drawCenteredString(g, "\"" + truncate(course.getTitle(), 48) + "\"", width, 365);

        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

        g.setColor(new Color(51, 65, 85));
        g.setFont(notoSansAwtDerived(Font.PLAIN, 16f));
        drawCenteredString(g, "Issued on " + dateStr, width, 478);

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

    private static void drawPdfCertificateFrame(PdfWriter writer) {
        com.lowagie.text.pdf.PdfContentByte cb = writer.getDirectContent();
        cb.saveState();
        cb.setColorStroke(new Color(30, 64, 175));
        cb.setLineWidth(3f);
        cb.roundRectangle(30, 30, PageSize.A4.getWidth() - 60, PageSize.A4.getHeight() - 60, 20);
        cb.stroke();
        cb.setColorStroke(new Color(191, 219, 254));
        cb.setLineWidth(1.2f);
        cb.roundRectangle(40, 40, PageSize.A4.getWidth() - 80, PageSize.A4.getHeight() - 80, 16);
        cb.stroke();
        cb.restoreState();
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
        String role = u.getRoles().stream()
                .map(r -> r.getName())
                .findFirst()
                .orElse("STUDENT");
        Long parentId = d.getParent() != null ? d.getParent().getId() : null;
        return new DiscussionResponse(
                d.getId(),
                u.getId(),
                u.getFullName(),
                role,
                d.getLesson().getId(),
                parentId,
                d.getContent(),
                d.getCreatedAt(),
                null);
    }

    private ReviewResponse toReviewResponse(CourseReview r) {
        return new ReviewResponse(
                r.getId(),
                r.getCourse().getId(),
                r.getUser().getId(),
                r.getUser().getFullName(),
                r.getRating(),
                r.getComment(),
                r.getCreatedAt());
    }

    private void assertCourseExists(Long courseId) {
        courseRepository.findById(courseId).orElseThrow(() -> courseNotFound(courseId));
    }

    private int normalizePercent(int value) {
        return Math.min(100, Math.max(0, value));
    }

    private DiscussionResponse toDiscussionResponseTree(LessonDiscussion d) {
        DiscussionResponse response = toDiscussionResponse(d);
        List<DiscussionResponse> replies = d.getReplies().stream()
                .sorted(Comparator.comparing(r -> r.getCreatedAt()))
                .map(this::toDiscussionResponseTree)
                .collect(Collectors.toList());
        response.setReplies(replies);
        return response;
    }

    private void assertEnrolled(Long userId, Long courseId) {
        if (!enrollmentRepository.existsByUser_IdAndCourse_Id(userId, courseId)) {
            throw notEnrolled();
        }
    }

    private void assertEnrolledOrInstructor(User user, Long courseId) {
        boolean isInstructor = user.getRoles().stream()
                .anyMatch(r -> {
                    String roleName = r.getName();
                    return "ROLE_INSTRUCTOR".equals(roleName)
                            || "INSTRUCTOR".equals(roleName)
                            || "ROLE_ADMIN".equals(roleName)
                            || "ADMIN".equals(roleName);
                });
        if (!isInstructor && !enrollmentRepository.existsByUser_IdAndCourse_Id(user.getId(), courseId)) {
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

    private static ApiBusinessException discussionNotFound(Long id) {
        Map<String, String> errors = new HashMap<>();
        errors.put(ERR_CODE, "DISCUSSION_NOT_FOUND");
        errors.put("id", String.valueOf(id));
        return new ApiBusinessException(HttpStatus.NOT_FOUND, new ErrorResource("Discussion not found", errors));
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

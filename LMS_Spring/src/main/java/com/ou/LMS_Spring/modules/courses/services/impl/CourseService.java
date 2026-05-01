package com.ou.LMS_Spring.modules.courses.services.impl;

import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import com.ou.LMS_Spring.Entities.Category;
import com.ou.LMS_Spring.Entities.Course;
import com.ou.LMS_Spring.Entities.CoursePublicationStatus;
import com.ou.LMS_Spring.Entities.Lesson;
import com.ou.LMS_Spring.Entities.LessonAttachment;
import com.ou.LMS_Spring.Entities.User;
import com.ou.LMS_Spring.Services.BaseService;
import com.ou.LMS_Spring.modules.assessments.repositories.AssessmentAssignmentRepository;
import com.ou.LMS_Spring.modules.assessments.repositories.AssessmentQuizQuestionRepository;
import com.ou.LMS_Spring.modules.assessments.repositories.AssessmentQuizRepository;
import com.ou.LMS_Spring.modules.assessments.repositories.AssessmentQuizSubmissionAnswerRepository;
import com.ou.LMS_Spring.modules.assessments.repositories.AssessmentQuizSubmissionRepository;
import com.ou.LMS_Spring.modules.assessments.repositories.AssignmentSubmissionRepository;
import com.ou.LMS_Spring.modules.courses.dtos.requests.AdminCourseStatusRequest;
import com.ou.LMS_Spring.modules.courses.dtos.requests.CourseCreateRequest;
import com.ou.LMS_Spring.modules.courses.dtos.requests.CourseUpdateRequest;
import com.ou.LMS_Spring.modules.courses.dtos.requests.LessonCreateRequest;
import com.ou.LMS_Spring.modules.courses.dtos.requests.LessonReorderRequest;
import com.ou.LMS_Spring.modules.courses.dtos.requests.LessonUpdateRequest;
import com.ou.LMS_Spring.modules.courses.dtos.responses.CourseDetailResponse;
import com.ou.LMS_Spring.modules.courses.dtos.responses.CourseSummaryResponse;
import com.ou.LMS_Spring.modules.courses.dtos.responses.LessonAttachmentResponse;
import com.ou.LMS_Spring.modules.courses.dtos.responses.LessonDetailResponse;
import com.ou.LMS_Spring.modules.courses.dtos.responses.LessonOutlineResponse;
import com.ou.LMS_Spring.modules.courses.repositories.LessonAttachmentRepository;
import com.ou.LMS_Spring.modules.courses.repositories.CategoryRepository;
import com.ou.LMS_Spring.modules.courses.repositories.CourseRepository;
import com.ou.LMS_Spring.modules.enrollments.repositories.EnrollmentRepository;
import com.ou.LMS_Spring.modules.courses.repositories.LessonRepository;
import com.ou.LMS_Spring.modules.courses.services.interfaces.ICourseService;
import com.ou.LMS_Spring.modules.learnings.repositories.LessonDiscussionRepository;
import com.ou.LMS_Spring.modules.learnings.repositories.LessonProgressRepository;
import com.ou.LMS_Spring.modules.system.services.impl.CloudinaryService;
import com.ou.LMS_Spring.modules.users.repositories.UserRepository;

@Service
public class CourseService extends BaseService implements ICourseService {

    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonAttachmentRepository lessonAttachmentRepository;
    private final CloudinaryService cloudinaryService;
    private final LessonDiscussionRepository lessonDiscussionRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final AssessmentAssignmentRepository assessmentAssignmentRepository;
    private final AssessmentQuizRepository assessmentQuizRepository;
    private final AssessmentQuizQuestionRepository assessmentQuizQuestionRepository;
    private final AssessmentQuizSubmissionRepository assessmentQuizSubmissionRepository;
    private final AssessmentQuizSubmissionAnswerRepository assessmentQuizSubmissionAnswerRepository;

    public CourseService(
            CourseRepository courseRepository,
            LessonRepository lessonRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository,
            EnrollmentRepository enrollmentRepository,
            LessonAttachmentRepository lessonAttachmentRepository,
            CloudinaryService cloudinaryService,
            LessonDiscussionRepository lessonDiscussionRepository,
            LessonProgressRepository lessonProgressRepository,
            AssignmentSubmissionRepository assignmentSubmissionRepository,
            AssessmentAssignmentRepository assessmentAssignmentRepository,
            AssessmentQuizRepository assessmentQuizRepository,
            AssessmentQuizQuestionRepository assessmentQuizQuestionRepository,
            AssessmentQuizSubmissionRepository assessmentQuizSubmissionRepository,
            AssessmentQuizSubmissionAnswerRepository assessmentQuizSubmissionAnswerRepository) {
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.lessonAttachmentRepository = lessonAttachmentRepository;
        this.cloudinaryService = cloudinaryService;
        this.lessonDiscussionRepository = lessonDiscussionRepository;
        this.lessonProgressRepository = lessonProgressRepository;
        this.assignmentSubmissionRepository = assignmentSubmissionRepository;
        this.assessmentAssignmentRepository = assessmentAssignmentRepository;
        this.assessmentQuizRepository = assessmentQuizRepository;
        this.assessmentQuizQuestionRepository = assessmentQuizQuestionRepository;
        this.assessmentQuizSubmissionRepository = assessmentQuizSubmissionRepository;
        this.assessmentQuizSubmissionAnswerRepository = assessmentQuizSubmissionAnswerRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseSummaryResponse> listPublishedCourses() {
        return courseRepository.findByPublicationStatusOrderByTitleAsc(CoursePublicationStatus.PUBLISHED).stream()
                .filter(Course::isActive)
                .map(CourseSummaryResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CourseDetailResponse getPublishedCourseDetail(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        if (!course.isActive() || course.getPublicationStatus() != CoursePublicationStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found");
        }
        return toDetail(course);
    }

    @Override
    @Transactional(readOnly = true)
    public CourseDetailResponse getMyCourseDetail(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        assertCourseInstructorOrAdmin(course);
        return toDetail(course);
    }

    @Override
    @Transactional(readOnly = true)
    public LessonDetailResponse getPublishedLesson(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
        Course course = lesson.getCourse();
        if (!course.isActive() || course.getPublicationStatus() != CoursePublicationStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found");
        }
        return toLessonDetailWithAttachments(lesson);
    }

    @Override
    @Transactional(readOnly = true)
    public LessonDetailResponse getMyLessonDetail(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
        assertCourseInstructorOrAdmin(lesson.getCourse());
        return toLessonDetailWithAttachments(lesson);
    }

    @Override
    @Transactional
    public LessonAttachmentResponse uploadAttachment(Long lessonId, MultipartFile file) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
        assertCourseInstructorOrAdmin(lesson.getCourse());

        String fileUrl = cloudinaryService.uploadFile(file, "attachments");

        LessonAttachment attachment = new LessonAttachment();
        attachment.setLesson(lesson);
        attachment.setFileName(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
        attachment.setFileUrl(fileUrl);
        String contentType = file.getContentType();
        attachment.setFileType((contentType == null || contentType.isBlank()) ? "application/octet-stream" : contentType);
        attachment.setFileSize(file.getSize());

        LessonAttachment saved = lessonAttachmentRepository.save(attachment);
        return LessonAttachmentResponse.from(saved);
    }

    @Override
    @Transactional
    public void deleteAttachment(Long attachmentId) {
        LessonAttachment attachment = lessonAttachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment not found"));
        assertCourseInstructorOrAdmin(attachment.getLesson().getCourse());
        lessonAttachmentRepository.delete(attachment);
    }

    @Override
    @Transactional
    public CourseDetailResponse createCourse(CourseCreateRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
        User instructor = userRepository.findById(request.getInstructorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Instructor not found"));
        if (!isCurrentUserAdmin()) {
            User me = currentUser();
            if (!instructor.getId().equals(me.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "You may only create a course with yourself as instructor");
            }
        }

        Course course = new Course();
        course.setTitle(request.getTitle().trim());
        course.setDescription(request.getDescription());
        course.setCategory(category);
        course.setInstructor(instructor);
        course.setPublicationStatus(Boolean.TRUE.equals(request.getSubmitForReview())
                ? CoursePublicationStatus.PENDING_REVIEW
                : CoursePublicationStatus.DRAFT);
        course.setRejectionReason(null);
        Course saved = courseRepository.save(course);
        return toDetail(saved);
    }

    @Override
    @Transactional
    public CourseDetailResponse updateCourse(Long id, CourseUpdateRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        assertCourseInstructorOrAdmin(course);
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        course.setTitle(request.getTitle().trim());
        course.setDescription(request.getDescription());
        course.setCategory(category);

        if (Boolean.TRUE.equals(request.getSubmitForReview())) {
            CoursePublicationStatus st = course.getPublicationStatus();
            if (st == CoursePublicationStatus.DRAFT || st == CoursePublicationStatus.REJECTED) {
                course.setPublicationStatus(CoursePublicationStatus.PENDING_REVIEW);
                course.setRejectionReason(null);
            }
        }

        Course saved = courseRepository.save(course);
        return toDetail(saved);
    }

    @Override
    @Transactional
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        assertCourseInstructorOrAdmin(course);
        if (enrollmentRepository.countByCourse_Id(id) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot delete course with active enrollments");
        }
        List<Lesson> lessons = new ArrayList<>(lessonRepository.findByCourse_IdOrderByOrderIndexAsc(id));
        lessonRepository.deleteAll(lessons);
        courseRepository.delete(course);
    }

    @Override
    @Transactional
    public LessonDetailResponse addLesson(Long courseId, LessonCreateRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        assertCourseInstructorOrAdmin(course);
        Integer maxIdx = lessonRepository.findMaxOrderIndexByCourseId(courseId);
        int max = maxIdx != null ? maxIdx : -1;
        Lesson lesson = new Lesson();
        lesson.setCourse(course);
        applyLessonContent(lesson, request.getTitle(), request.getContent(), request.getVideoUrl());
        lesson.setOrderIndex(max + 1);
        Lesson saved = lessonRepository.save(lesson);
        return LessonDetailResponse.from(saved);
    }

    @Override
    @Transactional
    public LessonDetailResponse updateLesson(Long lessonId, LessonUpdateRequest request) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
        assertCourseInstructorOrAdmin(lesson.getCourse());
        applyLessonContent(lesson, request.getTitle(), request.getContent(), request.getVideoUrl());
        Lesson saved = lessonRepository.save(lesson);
        return LessonDetailResponse.from(saved);
    }

    @Override
    @Transactional
    public void deleteLesson(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
        assertCourseInstructorOrAdmin(lesson.getCourse());
        Long courseId = lesson.getCourse().getId();

        lessonAttachmentRepository.deleteByLesson_Id(lessonId);
        lessonDiscussionRepository.deleteByLesson_Id(lessonId);
        lessonProgressRepository.deleteByLesson_Id(lessonId);
        assignmentSubmissionRepository.deleteByLesson_Id(lessonId);
        assessmentAssignmentRepository.findByLesson_Id(lessonId).ifPresent(assessmentAssignmentRepository::delete);
        assessmentQuizRepository.findByLesson_Id(lessonId).ifPresent(quiz -> {
            Long quizId = quiz.getId();
            List<Long> submissionIds = assessmentQuizSubmissionRepository.findByQuiz_Id(quizId).stream()
                    .map(s -> s.getId())
                    .toList();
            if (!submissionIds.isEmpty()) {
                assessmentQuizSubmissionAnswerRepository.deleteBySubmission_IdIn(submissionIds);
            }
            assessmentQuizSubmissionRepository.deleteByQuiz_Id(quizId);
            assessmentQuizQuestionRepository.deleteByQuiz_Id(quizId);
            assessmentQuizRepository.delete(quiz);
        });

        lessonRepository.delete(lesson);
        renumberLessons(courseId);
    }

    @Override
    @Transactional
    public LessonDetailResponse reorderLesson(Long lessonId, LessonReorderRequest request) {
        Lesson moving = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
        Course course = moving.getCourse();
        assertCourseInstructorOrAdmin(course);
        List<Lesson> ordered = new ArrayList<>(lessonRepository.findByCourse_IdOrderByOrderIndexAsc(course.getId()));

        List<Lesson> without = new ArrayList<>();
        for (Lesson l : ordered) {
            if (!l.getId().equals(lessonId)) {
                without.add(l);
            }
        }

        int pos = request.getPosition();
        pos = Math.max(0, Math.min(pos, without.size()));
        without.add(pos, moving);

        for (int i = 0; i < without.size(); i++) {
            without.get(i).setOrderIndex(i);
        }
        lessonRepository.saveAll(without);
        Lesson refreshed = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
        return LessonDetailResponse.from(refreshed);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseSummaryResponse> listMyCoursesAsInstructor() {
        User me = currentUser();
        return courseRepository.findByInstructor_IdOrderByUpdatedAtDesc(me.getId())
                .stream()
                .filter(Course::isActive)
                .map(CourseSummaryResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseSummaryResponse> listPendingReview() {
        return courseRepository
                .findByPublicationStatusOrderByUpdatedAtDesc(CoursePublicationStatus.PENDING_REVIEW).stream()
                .filter(Course::isActive)
                .map(CourseSummaryResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CourseDetailResponse adminGetCourseDetail(Long courseId) {
        assertAdmin();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        return toDetail(course);
    }

    @Override
    @Transactional(readOnly = true)
    public LessonDetailResponse adminGetLessonDetail(Long lessonId) {
        assertAdmin();
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
        return toLessonDetailWithAttachments(lesson);
    }

    @Override
    @Transactional
    public CourseDetailResponse adminUpdateStatus(Long courseId, AdminCourseStatusRequest request) {
        assertAdmin();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        CoursePublicationStatus newStatus = request.getStatus();
        if (newStatus != CoursePublicationStatus.PUBLISHED && newStatus != CoursePublicationStatus.REJECTED) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Admin may only set status to PUBLISHED or REJECTED");
        }

        if (newStatus == CoursePublicationStatus.REJECTED) {
            if (request.getReason() == null || request.getReason().isBlank()) {
                throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                        "Rejection reason is required when rejecting a course");
            }
            course.setRejectionReason(request.getReason().trim());
        } else {
            course.setRejectionReason(null);
        }

        course.setPublicationStatus(newStatus);
        Course saved = courseRepository.save(course);
        return toDetail(saved);
    }

    private CourseDetailResponse toDetail(Course course) {
        List<LessonOutlineResponse> outlines = lessonRepository.findByCourse_IdOrderByOrderIndexAsc(course.getId())
                .stream()
                .map(LessonOutlineResponse::from)
                .toList();
        return CourseDetailResponse.from(course, outlines);
    }

    private LessonDetailResponse toLessonDetailWithAttachments(Lesson lesson) {
        LessonDetailResponse response = LessonDetailResponse.from(lesson);
        response.setAttachments(
                lessonAttachmentRepository.findByLesson_IdOrderByCreatedAtAsc(lesson.getId()).stream()
                        .map(LessonAttachmentResponse::from)
                        .toList());
        return response;
    }

    private void applyLessonContent(Lesson lesson, String title, String content, String videoUrl) {
        lesson.setTitle(title.trim());
        lesson.setContent(content);
        lesson.setVideoUrl(videoUrl);
    }

    private void renumberLessons(Long courseId) {
        List<Lesson> list = lessonRepository.findByCourse_IdOrderByOrderIndexAsc(courseId);
        for (int i = 0; i < list.size(); i++) {
            list.get(i).setOrderIndex(i);
        }
        lessonRepository.saveAll(list);
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private void assertAdmin() {
        if (!isCurrentUserAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
    }

    private boolean isCurrentUserAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getAuthorities() == null) {
            return false;
        }
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }

    private void assertCourseInstructorOrAdmin(Course course) {
        if (isCurrentUserAdmin()) {
            return;
        }
        User instructor = course.getInstructor();
        User me = currentUser();
        if (instructor == null || !instructor.getId().equals(me.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to modify this course");
        }
    }
}

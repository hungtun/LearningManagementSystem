package com.ou.LMS_Spring.modules.enrollments.services.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ou.LMS_Spring.Entities.Course;
import com.ou.LMS_Spring.Entities.Enrollment;
import com.ou.LMS_Spring.Entities.EnrollmentStatus;
import com.ou.LMS_Spring.Entities.User;
import com.ou.LMS_Spring.helpers.ApiBusinessException;
import com.ou.LMS_Spring.modules.courses.repositories.CourseRepository;
import com.ou.LMS_Spring.modules.enrollments.dtos.requests.EnrollmentRequest;
import com.ou.LMS_Spring.modules.enrollments.dtos.responses.CourseStudentResponse;
import com.ou.LMS_Spring.modules.enrollments.dtos.responses.EnrollmentResponse;
import com.ou.LMS_Spring.modules.enrollments.dtos.responses.EnrollmentStatsResponse;
import com.ou.LMS_Spring.modules.enrollments.dtos.responses.MyCourseItemResponse;
import com.ou.LMS_Spring.modules.enrollments.repositories.EnrollmentRepository;
import com.ou.LMS_Spring.modules.enrollments.services.interfaces.IEnrollmentService;
import com.ou.LMS_Spring.modules.users.repositories.UserRepository;
import com.ou.LMS_Spring.resources.ErrorResource;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EnrollmentService implements IEnrollmentService {

    private static final String ERR_CODE = "code";

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Override
    @Transactional
    public EnrollmentResponse enroll(EnrollmentRequest request) {
        User user = currentUser();

        Long courseId = request.getCourseId();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> courseNotFound(courseId));

        if (enrollmentRepository.existsByUser_IdAndCourse_Id(user.getId(), course.getId())) {
            throw alreadyEnrolled();
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setUser(user);
        enrollment.setCourse(course);
        enrollment.setStatus(EnrollmentStatus.ACTIVE);
        enrollment.setEnrolledAt(LocalDateTime.now());

        Enrollment saved = enrollmentRepository.save(enrollment);

        return new EnrollmentResponse(
                saved.getId(),
                course.getId(),
                course.getTitle(),
                saved.getStatus(),
                saved.getEnrolledAt());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MyCourseItemResponse> myCourses() {
        User user = currentUser();
        return enrollmentRepository.findByUser_IdOrderByEnrolledAtDesc(user.getId()).stream()
                .map(e -> new MyCourseItemResponse(
                        e.getId(),
                        e.getCourse().getId(),
                        e.getCourse().getTitle(),
                        e.getStatus(),
                        e.getEnrolledAt()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseStudentResponse> listStudentsForCourse(Long courseId) {
        User me = currentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> courseNotFound(courseId));
        if (!canAccessCourseRoster(me, course)) {
            throw rosterForbidden();
        }
        return enrollmentRepository.findByCourse_IdOrderByEnrolledAtDesc(courseId).stream()
                .map(e -> {
                    User u = e.getUser();
                    return new CourseStudentResponse(
                            u.getId(),
                            u.getEmail(),
                            u.getFullName(),
                            e.getStatus(),
                            e.getEnrolledAt());
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentStatsResponse> enrollmentStats(LocalDate from, LocalDate to) {
        LocalDate endDate = to != null ? to : LocalDate.now();
        LocalDate startDate = from != null ? from : endDate.minusDays(30);
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.plusDays(1).atStartOfDay();
        List<Object[]> rows = enrollmentRepository.countEnrollmentsByDay(start, end);
        List<EnrollmentStatsResponse> out = new ArrayList<>();
        for (Object[] row : rows) {
            String day = row[0] != null ? row[0].toString() : "";
            long cnt = row[1] instanceof Number ? ((Number) row[1]).longValue() : 0L;
            out.add(new EnrollmentStatsResponse(day, cnt));
        }
        return out;
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    private boolean canAccessCourseRoster(User me, Course course) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getAuthorities() == null) {
            return false;
        }
        boolean isAdmin = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
        if (isAdmin) {
            return true;
        }
        boolean isInstructor = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_INSTRUCTOR"::equals);
        if (!isInstructor) {
            return false;
        }
        User instructor = course.getInstructor();
        return instructor != null && instructor.getId().equals(me.getId());
    }

    private static ApiBusinessException courseNotFound(Long courseId) {
        Map<String, String> errors = new HashMap<>();
        errors.put(ERR_CODE, "COURSE_NOT_FOUND");
        errors.put("courseId", "No course with this id");
        return new ApiBusinessException(HttpStatus.NOT_FOUND, new ErrorResource("Course not found", errors));
    }

    private static ApiBusinessException alreadyEnrolled() {
        Map<String, String> errors = new HashMap<>();
        errors.put(ERR_CODE, "ALREADY_ENROLLED");
        errors.put("message", "Already enrolled in this course");
        return new ApiBusinessException(HttpStatus.CONFLICT, new ErrorResource("Already enrolled", errors));
    }

    private static ApiBusinessException rosterForbidden() {
        Map<String, String> errors = new HashMap<>();
        errors.put(ERR_CODE, "FORBIDDEN");
        errors.put("message", "Not allowed to view this course roster");
        return new ApiBusinessException(HttpStatus.FORBIDDEN, new ErrorResource("Forbidden", errors));
    }
}

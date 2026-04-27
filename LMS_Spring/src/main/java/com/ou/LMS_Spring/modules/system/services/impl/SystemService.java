package com.ou.LMS_Spring.modules.system.services.impl;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ou.LMS_Spring.Entities.Category;
import com.ou.LMS_Spring.Entities.CoursePublicationStatus;
import com.ou.LMS_Spring.Entities.Notification;
import com.ou.LMS_Spring.Entities.User;
import com.ou.LMS_Spring.Services.BaseService;
import com.ou.LMS_Spring.helpers.exceptions.CategoryNameConflictException;
import com.ou.LMS_Spring.helpers.exceptions.CategoryNotFoundException;
import com.ou.LMS_Spring.helpers.exceptions.UserNotFoundException;
import com.ou.LMS_Spring.modules.courses.repositories.CategoryRepository;
import com.ou.LMS_Spring.modules.courses.repositories.CourseRepository;
import com.ou.LMS_Spring.modules.enrollments.repositories.EnrollmentRepository;
import com.ou.LMS_Spring.modules.system.dtos.requests.BroadcastNotificationRequest;
import com.ou.LMS_Spring.modules.system.dtos.requests.UpsertCategoryRequest;
import com.ou.LMS_Spring.modules.system.dtos.responses.AdminAnalyticsResponse;
import com.ou.LMS_Spring.modules.system.dtos.responses.CategoryResponse;
import com.ou.LMS_Spring.modules.system.dtos.responses.InstructorAnalyticsResponse;
import com.ou.LMS_Spring.modules.system.dtos.responses.NotificationResponse;
import com.ou.LMS_Spring.modules.system.repositories.NotificationRepository;
import com.ou.LMS_Spring.modules.system.services.interfaces.ISystemService;
import com.ou.LMS_Spring.modules.users.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SystemService extends BaseService implements ISystemService {

    private static final String INSTRUCTOR_ROLE = "INSTRUCTOR";

    private final CategoryRepository categoryRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> listCategories() {
        return categoryRepository.findAll().stream()
                .filter(Category::isActive)
                .map(this::toCategoryResponse)
                .toList();
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(UpsertCategoryRequest request) {
        String normalizedName = request.getName().trim();
        if (categoryRepository.existsByNameIgnoreCase(normalizedName)) {
            throw new CategoryNameConflictException(normalizedName);
        }

        Category category = new Category();
        category.setName(normalizedName);
        category.setDescription(trimToNull(request.getDescription()));
        Category saved = categoryRepository.save(category);
        return toCategoryResponse(saved);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, UpsertCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .filter(Category::isActive)
                .orElseThrow(() -> new CategoryNotFoundException(id));

        String normalizedName = request.getName().trim();
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(normalizedName, id)) {
            throw new CategoryNameConflictException(normalizedName);
        }

        category.setName(normalizedName);
        category.setDescription(trimToNull(request.getDescription()));
        Category saved = categoryRepository.save(category);
        return toCategoryResponse(saved);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .filter(Category::isActive)
                .orElseThrow(() -> new CategoryNotFoundException(id));
        category.setActive(false);
        categoryRepository.save(category);
    }

    @Override
    @Transactional(readOnly = true)
    public InstructorAnalyticsResponse getInstructorAnalytics() {
        User currentUser = currentUser();
        long totalCourses = courseRepository.countByInstructor_Id(currentUser.getId());
        long publishedCourses = courseRepository.countByInstructor_IdAndPublicationStatus(
                currentUser.getId(), CoursePublicationStatus.PUBLISHED);
        long totalEnrollments = enrollmentRepository.countByCourse_Instructor_Id(currentUser.getId());
        return new InstructorAnalyticsResponse(totalCourses, publishedCourses, totalEnrollments);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminAnalyticsResponse getAdminAnalytics() {
        long totalUsers = userRepository.count();
        long totalInstructors = userRepository.countByRoles_Name(INSTRUCTOR_ROLE);
        long totalCourses = courseRepository.count();
        long publishedCourses = courseRepository.countByPublicationStatus(CoursePublicationStatus.PUBLISHED);
        long totalEnrollments = enrollmentRepository.count();
        long totalCategories = categoryRepository.count();
        return new AdminAnalyticsResponse(
                totalUsers,
                totalInstructors,
                totalCourses,
                publishedCourses,
                totalEnrollments,
                totalCategories);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> listMyNotifications() {
        User currentUser = currentUser();
        return notificationRepository
                .findByIsActiveTrueAndRecipient_IdOrIsActiveTrueAndBroadcastTrueOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::toNotificationResponse)
                .toList();
    }

    @Override
    @Transactional
    public NotificationResponse broadcastNotification(BroadcastNotificationRequest request) {
        Notification notification = new Notification();
        notification.setTitle(request.getTitle().trim());
        notification.setContent(request.getContent().trim());
        notification.setBroadcast(true);
        notification.setRecipient(null);
        Notification saved = notificationRepository.save(notification);
        return toNotificationResponse(saved);
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException());
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private CategoryResponse toCategoryResponse(Category category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getDescription());
    }

    private NotificationResponse toNotificationResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getContent(),
                notification.isBroadcast(),
                notification.getCreatedAt());
    }
}

package com.ou.LMS_Spring.modules.courses.services.interfaces;

import java.util.List;

import com.ou.LMS_Spring.modules.courses.dtos.requests.AdminCourseStatusRequest;
import com.ou.LMS_Spring.modules.courses.dtos.requests.CourseCreateRequest;
import com.ou.LMS_Spring.modules.courses.dtos.requests.CourseUpdateRequest;
import com.ou.LMS_Spring.modules.courses.dtos.requests.LessonCreateRequest;
import com.ou.LMS_Spring.modules.courses.dtos.requests.LessonReorderRequest;
import com.ou.LMS_Spring.modules.courses.dtos.requests.LessonUpdateRequest;
import com.ou.LMS_Spring.modules.courses.dtos.responses.CourseDetailResponse;
import com.ou.LMS_Spring.modules.courses.dtos.responses.CourseSummaryResponse;
import com.ou.LMS_Spring.modules.courses.dtos.responses.LessonDetailResponse;

public interface ICourseService {

    List<CourseSummaryResponse> listPublishedCourses();

    CourseDetailResponse getPublishedCourseDetail(Long id);

    LessonDetailResponse getPublishedLesson(Long lessonId);

    CourseDetailResponse createCourse(CourseCreateRequest request);

    CourseDetailResponse updateCourse(Long id, CourseUpdateRequest request);

    void deleteCourse(Long id);

    LessonDetailResponse addLesson(Long courseId, LessonCreateRequest request);

    LessonDetailResponse updateLesson(Long lessonId, LessonUpdateRequest request);

    void deleteLesson(Long lessonId);

    LessonDetailResponse reorderLesson(Long lessonId, LessonReorderRequest request);

    List<CourseSummaryResponse> listMyCoursesAsInstructor();

    List<CourseSummaryResponse> listPendingReview();

    CourseDetailResponse adminUpdateStatus(Long courseId, AdminCourseStatusRequest request);
}

package com.ou.LMS_Spring.modules.enrollments.services.interfaces;

import java.time.LocalDate;
import java.util.List;

import com.ou.LMS_Spring.modules.enrollments.dtos.requests.EnrollmentRequest;
import com.ou.LMS_Spring.modules.enrollments.dtos.responses.CourseStudentResponse;
import com.ou.LMS_Spring.modules.enrollments.dtos.responses.EnrollmentResponse;
import com.ou.LMS_Spring.modules.enrollments.dtos.responses.EnrollmentStatsResponse;
import com.ou.LMS_Spring.modules.enrollments.dtos.responses.MyCourseItemResponse;

public interface IEnrollmentService {

    EnrollmentResponse enroll(EnrollmentRequest request);

    List<MyCourseItemResponse> myCourses();

    List<CourseStudentResponse> listStudentsForCourse(Long courseId);

    List<EnrollmentStatsResponse> enrollmentStats(LocalDate from, LocalDate to);
}

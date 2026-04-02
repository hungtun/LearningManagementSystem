package com.ou.LMS_Spring.modules.courses.dtos.responses;

import java.util.List;

import com.ou.LMS_Spring.Entities.Course;

public class CourseDetailResponse extends CourseSummaryResponse {

    private List<LessonOutlineResponse> lessons;

    public static CourseDetailResponse from(Course course, List<LessonOutlineResponse> lessonOutlines) {
        CourseDetailResponse r = new CourseDetailResponse();
        CourseSummaryResponse base = CourseSummaryResponse.from(course);
        r.setId(base.getId());
        r.setTitle(base.getTitle());
        r.setDescription(base.getDescription());
        r.setCategoryId(base.getCategoryId());
        r.setCategoryName(base.getCategoryName());
        r.setInstructorId(base.getInstructorId());
        r.setInstructorName(base.getInstructorName());
        r.setPublicationStatus(base.getPublicationStatus());
        r.setRejectionReason(base.getRejectionReason());
        r.setLessons(lessonOutlines);
        return r;
    }

    public List<LessonOutlineResponse> getLessons() {
        return lessons;
    }

    public void setLessons(List<LessonOutlineResponse> lessons) {
        this.lessons = lessons;
    }
}

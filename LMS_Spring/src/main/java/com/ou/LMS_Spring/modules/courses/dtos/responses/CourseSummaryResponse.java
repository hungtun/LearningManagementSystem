package com.ou.LMS_Spring.modules.courses.dtos.responses;

import com.ou.LMS_Spring.Entities.Course;
import com.ou.LMS_Spring.Entities.CoursePublicationStatus;

public class CourseSummaryResponse {

    private Long id;
    private String title;
    private String description;
    private Long categoryId;
    private String categoryName;
    private Long instructorId;
    private String instructorName;
    private String instructorAvatarUrl;
    private CoursePublicationStatus publicationStatus;
    private String rejectionReason;

    public static CourseSummaryResponse from(Course course) {
        CourseSummaryResponse r = new CourseSummaryResponse();
        r.setId(course.getId());
        r.setTitle(course.getTitle());
        r.setDescription(course.getDescription());
        r.setCategoryId(course.getCategory().getId());
        r.setCategoryName(course.getCategory().getName());
        if (course.getInstructor() != null) {
            r.setInstructorId(course.getInstructor().getId());
            r.setInstructorName(course.getInstructor().getFullName());
            r.setInstructorAvatarUrl(course.getInstructor().getAvatarUrl());
        }
        r.setPublicationStatus(course.getPublicationStatus());
        r.setRejectionReason(course.getRejectionReason());
        return r;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Long getInstructorId() {
        return instructorId;
    }

    public void setInstructorId(Long instructorId) {
        this.instructorId = instructorId;
    }

    public String getInstructorName() {
        return instructorName;
    }

    public void setInstructorName(String instructorName) {
        this.instructorName = instructorName;
    }

    public String getInstructorAvatarUrl() {
        return instructorAvatarUrl;
    }

    public void setInstructorAvatarUrl(String instructorAvatarUrl) {
        this.instructorAvatarUrl = instructorAvatarUrl;
    }

    public CoursePublicationStatus getPublicationStatus() {
        return publicationStatus;
    }

    public void setPublicationStatus(CoursePublicationStatus publicationStatus) {
        this.publicationStatus = publicationStatus;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}

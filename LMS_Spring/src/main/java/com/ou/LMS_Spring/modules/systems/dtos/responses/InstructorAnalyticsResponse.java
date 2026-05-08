package com.ou.LMS_Spring.modules.systems.dtos.responses;

public class InstructorAnalyticsResponse {

    private long totalCourses;
    private long publishedCourses;
    private long totalEnrollments;

    public InstructorAnalyticsResponse(long totalCourses, long publishedCourses, long totalEnrollments) {
        this.totalCourses = totalCourses;
        this.publishedCourses = publishedCourses;
        this.totalEnrollments = totalEnrollments;
    }

    public long getTotalCourses() {
        return totalCourses;
    }

    public long getPublishedCourses() {
        return publishedCourses;
    }

    public long getTotalEnrollments() {
        return totalEnrollments;
    }
}

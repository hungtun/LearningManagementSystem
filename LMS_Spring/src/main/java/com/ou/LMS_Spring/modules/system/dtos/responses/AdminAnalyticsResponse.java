package com.ou.LMS_Spring.modules.system.dtos.responses;

public class AdminAnalyticsResponse {

    private long totalUsers;
    private long totalInstructors;
    private long totalCourses;
    private long publishedCourses;
    private long totalEnrollments;
    private long totalCategories;

    public AdminAnalyticsResponse(long totalUsers, long totalInstructors, long totalCourses, long publishedCourses,
            long totalEnrollments, long totalCategories) {
        this.totalUsers = totalUsers;
        this.totalInstructors = totalInstructors;
        this.totalCourses = totalCourses;
        this.publishedCourses = publishedCourses;
        this.totalEnrollments = totalEnrollments;
        this.totalCategories = totalCategories;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public long getTotalInstructors() {
        return totalInstructors;
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

    public long getTotalCategories() {
        return totalCategories;
    }
}

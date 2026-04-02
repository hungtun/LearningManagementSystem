package com.ou.LMS_Spring.modules.courses.dtos.requests;

import com.ou.LMS_Spring.Entities.CoursePublicationStatus;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AdminCourseStatusRequest {

    @NotNull(message = "Status is required")
    private CoursePublicationStatus status;

    @Size(max = 2000, message = "Reason is too long")
    private String reason;

    public CoursePublicationStatus getStatus() {
        return status;
    }

    public void setStatus(CoursePublicationStatus status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}

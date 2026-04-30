package com.ou.LMS_Spring.modules.assessments.dtos.responses;

import java.time.LocalDateTime;

import com.ou.LMS_Spring.Entities.Assignment;

public class AssignmentResponse {

    private Long id;
    private Long lessonId;
    private String title;
    private String description;
    private LocalDateTime deadline;
    private LocalDateTime createdAt;

    public static AssignmentResponse from(Assignment a) {
        AssignmentResponse r = new AssignmentResponse();
        r.setId(a.getId());
        r.setLessonId(a.getLesson().getId());
        r.setTitle(a.getTitle());
        r.setDescription(a.getDescription());
        r.setDeadline(a.getDeadline());
        r.setCreatedAt(a.getCreatedAt());
        return r;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getLessonId() { return lessonId; }
    public void setLessonId(Long lessonId) { this.lessonId = lessonId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

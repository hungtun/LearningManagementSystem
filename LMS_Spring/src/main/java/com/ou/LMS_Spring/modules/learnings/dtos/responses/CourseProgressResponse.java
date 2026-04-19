package com.ou.LMS_Spring.modules.learnings.dtos.responses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseProgressResponse {
    private Long courseId;
    private double completionPercent;
    private int completedLessons;
    private int totalLessons;
}

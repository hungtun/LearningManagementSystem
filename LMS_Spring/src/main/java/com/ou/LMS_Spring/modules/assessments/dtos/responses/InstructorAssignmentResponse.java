package com.ou.LMS_Spring.modules.assessments.dtos.responses;

import java.time.LocalDateTime;

import com.ou.LMS_Spring.Entities.AssessmentAssignment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InstructorAssignmentResponse {
    private Long assignmentId;
    private Long lessonId;
    private String title;
    private String description;
    private int maxScore;
    private LocalDateTime startAt;
    private LocalDateTime endAt;

    public static InstructorAssignmentResponse from(AssessmentAssignment a) {
        return new InstructorAssignmentResponse(
                a.getId(),
                a.getLesson().getId(),
                a.getTitle(),
                a.getDescription(),
                a.getMaxScore(),
                a.getStartAt(),
                a.getEndAt());
    }
}

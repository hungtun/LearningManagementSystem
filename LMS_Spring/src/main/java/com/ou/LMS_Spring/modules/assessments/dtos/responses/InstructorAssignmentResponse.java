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

    private Long mySubmissionId;
    private String mySubmissionFilename;
    private LocalDateTime mySubmittedAt;
    private String mySubmissionNote;
    private Integer myScore;
    private LocalDateTime myGradedAt;
    private String myFeedback;
    private Boolean myCanResubmit;

    public static InstructorAssignmentResponse from(AssessmentAssignment a) {
        InstructorAssignmentResponse dto = new InstructorAssignmentResponse();
        dto.setAssignmentId(a.getId());
        dto.setLessonId(a.getLesson().getId());
        dto.setTitle(a.getTitle());
        dto.setDescription(a.getDescription());
        dto.setMaxScore(a.getMaxScore());
        dto.setStartAt(a.getStartAt());
        dto.setEndAt(a.getEndAt());
        return dto;
    }
}

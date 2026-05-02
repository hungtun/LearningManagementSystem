package com.ou.LMS_Spring.modules.assessments.dtos.responses;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class InstructorSubmissionItemResponse {

    private String submissionType;
    private Long submissionId;
    private Long courseId;
    private Long lessonId;
    private String lessonTitle;
    private Long studentId;
    private String studentName;
    private Integer score;
    private Integer maxScore;
    private String feedback;
    private LocalDateTime submittedAt;
    private LocalDateTime gradedAt;

    private String assessmentTitle;

    private String assignmentNote;
    private String assignmentOriginalFilename;

    private List<InstructorQuizAnswerItemResponse> quizAnswers = new ArrayList<>();
}

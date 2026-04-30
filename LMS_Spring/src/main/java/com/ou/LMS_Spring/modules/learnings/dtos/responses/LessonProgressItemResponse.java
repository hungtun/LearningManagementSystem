package com.ou.LMS_Spring.modules.learnings.dtos.responses;

import com.ou.LMS_Spring.Entities.LessonProgressStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LessonProgressItemResponse {
    private Long lessonId;
    private int progressPercent;
    private LessonProgressStatus status;
}

package com.ou.LMS_Spring.modules.learnings.dtos.responses;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiscussionResponse {
    private Long id;
    private Long userId;
    private String userFullName;
    private Long lessonId;
    private String content;
    private LocalDateTime createdAt;
}

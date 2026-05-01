package com.ou.LMS_Spring.modules.learnings.dtos.responses;

import java.time.LocalDateTime;
import java.util.List;

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
    private String userRole;
    private Long lessonId;
    private Long parentId;
    private String content;
    private LocalDateTime createdAt;
    private List<DiscussionResponse> replies;
}

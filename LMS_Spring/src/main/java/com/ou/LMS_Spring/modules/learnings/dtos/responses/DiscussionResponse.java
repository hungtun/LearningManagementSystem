package com.ou.LMS_Spring.modules.learnings.dtos.responses;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class DiscussionResponse {
    private Long id;
    private Long userId;
    private String userFullName;
    // Highest role of the author: ADMIN, INSTRUCTOR, or STUDENT
    private String userRole;
    private Long lessonId;
    // Null for root discussions; points to parent discussion id for replies
    private Long parentId;
    private String content;
    private LocalDateTime createdAt;
    // Populated only for root discussions (1-level deep threading)
    private List<DiscussionResponse> replies;
}

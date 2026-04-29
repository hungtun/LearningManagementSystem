package com.ou.LMS_Spring.modules.learnings.dtos.responses;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long courseId;
    private Long userId;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;
}

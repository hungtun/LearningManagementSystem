package com.ou.LMS_Spring.modules.courses.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CourseUpdateRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 500, message = "Title is too long")
    private String title;

    @Size(max = 10000, message = "Description is too long")
    private String description;

    @NotNull(message = "Category is required")
    private Long categoryId;

    /**
     * If true, moves DRAFT or REJECTED course back to PENDING_REVIEW.
     */
    private Boolean submitForReview;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Boolean getSubmitForReview() {
        return submitForReview;
    }

    public void setSubmitForReview(Boolean submitForReview) {
        this.submitForReview = submitForReview;
    }
}

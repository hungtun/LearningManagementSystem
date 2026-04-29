package com.ou.LMS_Spring.modules.learnings.dtos.requests;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VideoProgressPatchRequest {

    @NotNull
    private Long lessonId;

    @NotNull
    @Min(0)
    @Max(100)
    private Integer progressPercent;
}

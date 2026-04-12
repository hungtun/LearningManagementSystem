package com.ou.LMS_Spring.modules.enrollments.dtos.responses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentStatsResponse {
    private String date;
    private long count;
}

package com.ou.LMS_Spring.Entities;

import jakarta.persistence.*;

@Entity
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long courseId;
    private String certificateUrl;

    public void setUserId(Long userId) { this.userId = userId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public void setCertificateUrl(String certificateUrl) { this.certificateUrl = certificateUrl; }
}
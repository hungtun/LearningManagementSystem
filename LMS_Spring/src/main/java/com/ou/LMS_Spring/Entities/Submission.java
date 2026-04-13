package com.ou.LMS_Spring.Entities;

import jakarta.persistence.*;

@Entity
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String fileUrl;

    @ManyToOne
    private Assignment assignment;

    public void setUserId(Long userId) { this.userId = userId; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public void setAssignment(Assignment assignment) { this.assignment = assignment; }
}
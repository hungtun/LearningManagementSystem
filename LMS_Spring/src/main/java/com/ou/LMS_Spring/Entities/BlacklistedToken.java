package com.ou.LMS_Spring.Entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "blacklisted_tokens")
public class BlacklistedToken extends BaseEntity {

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 512)
    private String token;
    
}

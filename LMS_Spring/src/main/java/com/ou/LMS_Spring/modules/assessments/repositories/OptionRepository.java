package com.ou.LMS_Spring.modules.assessments.repositories;

import com.ou.LMS_Spring.Entities.Option;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OptionRepository extends JpaRepository<Option, Long> {
}
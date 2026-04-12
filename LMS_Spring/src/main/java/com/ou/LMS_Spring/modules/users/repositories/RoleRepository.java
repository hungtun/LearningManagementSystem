package com.ou.LMS_Spring.modules.users.repositories;

import org.springframework.stereotype.Repository;

import com.ou.LMS_Spring.Entities.Role;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;


@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
    
}

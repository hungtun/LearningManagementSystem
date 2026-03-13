package com.ou.LMS_Spring.modules.users.repositories;

import org.springframework.stereotype.Repository;

import com.ou.LMS_Spring.Entities.User;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;


@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

}

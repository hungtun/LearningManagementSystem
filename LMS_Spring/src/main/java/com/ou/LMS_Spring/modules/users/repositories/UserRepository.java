package com.ou.LMS_Spring.modules.users.repositories;

import org.springframework.stereotype.Repository;

import com.ou.LMS_Spring.Entities.User;

import org.springframework.data.jpa.repository.JpaRepository;


@Repository
public interface UserRepository extends JpaRepository<User, Long> {

}

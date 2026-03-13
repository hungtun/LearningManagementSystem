package com.ou.LMS_Spring.Entities.seeds;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.webmvc.autoconfigure.WebMvcProperties.Apiversion.Use;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.ou.LMS_Spring.Entities.User;
import com.ou.LMS_Spring.modules.users.repositories.UserRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;


@Component
public class DbSeed implements CommandLineRunner {

    @PersistenceContext
    private EntityManager entityManager;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    @Override
    public void run(String... args) throws Exception {
        System.out.println("Seeding database...");
        if (isTableEmpty("User")) {
            String password = passwordEncoder.encode("password123");
            User user = new User();
            user.setEmail("test1@gmail.com");
            user.setPasswordHash(password);
            user.setFullName("Test User 1");

            userRepository.save(user);
            System.out.println("Database seeded successfully.");
        }
        
    }

    private boolean isTableEmpty(String tableName) {
        Long count = (Long) entityManager.createQuery("SELECT COUNT(id) FROM " + tableName + " e").getSingleResult();
        return count == 0;
    }


}

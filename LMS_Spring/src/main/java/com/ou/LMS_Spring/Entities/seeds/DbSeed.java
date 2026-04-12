package com.ou.LMS_Spring.Entities.seeds;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.ou.LMS_Spring.Entities.Category;
import com.ou.LMS_Spring.Entities.Course;
import com.ou.LMS_Spring.Entities.Enrollment;
import com.ou.LMS_Spring.Entities.EnrollmentStatus;
import com.ou.LMS_Spring.Entities.Lesson;
import com.ou.LMS_Spring.Entities.LessonProgress;
import com.ou.LMS_Spring.Entities.LessonProgressStatus;
import com.ou.LMS_Spring.Entities.Role;
import com.ou.LMS_Spring.Entities.User;
import com.ou.LMS_Spring.modules.courses.repositories.CourseRepository;
import com.ou.LMS_Spring.modules.enrollments.repositories.EnrollmentRepository;
import com.ou.LMS_Spring.modules.users.repositories.UserRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Component
public class DbSeed implements CommandLineRunner {

    private static final String SAMPLE_PASSWORD = "123456";

    @PersistenceContext
    private EntityManager entityManager;

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public DbSeed(
            PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            CourseRepository courseRepository,
            EnrollmentRepository enrollmentRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            System.out.println("DbSeed skipped: users table is not empty.");
            return;
        }

        System.out.println("DbSeed: inserting sample data...");

        String encodedPassword = passwordEncoder.encode(SAMPLE_PASSWORD);

        Role roleStudent = persistRole("STUDENT");
        Role roleInstructor = persistRole("INSTRUCTOR");
        Role roleAdmin = persistRole("ADMIN");
        entityManager.flush();

        Category catWeb = persistCategory("Web Development", "Frontend and backend topics.");
        Category catData = persistCategory("Data & Analytics", "SQL, statistics, and visualization.");
        Category catDesign = persistCategory("UX & Design", "Interface design and user research.");
        entityManager.flush();

        User admin = buildUser("admin@lms.local", encodedPassword, "System Admin", roleAdmin);
        User instructor = buildUser("instructor@lms.local", encodedPassword, "Jane Instructor", roleInstructor);
        User student1 = buildUser("student1@lms.local", encodedPassword, "Alex Student", roleStudent);
        User student2 = buildUser("student2@lms.local", encodedPassword, "Sam Student", roleStudent);

        admin = userRepository.save(admin);
        instructor = userRepository.save(instructor);
        student1 = userRepository.save(student1);
        student2 = userRepository.save(student2);

        Course courseJava = buildCourse(
                "Java Fundamentals",
                "OOP, collections, and streams for beginners.",
                catWeb,
                instructor);
        Course courseReact = buildCourse(
                "React for Beginners",
                "Components, hooks, and routing with a small SPA.",
                catWeb,
                instructor);
        Course courseSql = buildCourse(
                "SQL & Relational Data",
                "Queries, joins, and schema basics.",
                catData,
                instructor);
        Course courseUx = buildCourse(
                "UX Foundations",
                "User research, personas, and low-fidelity wireframes.",
                catDesign,
                instructor);

        courseJava = courseRepository.save(courseJava);
        courseReact = courseRepository.save(courseReact);
        courseSql = courseRepository.save(courseSql);
        courseUx = courseRepository.save(courseUx);

        persistLesson(courseJava, "Introduction to Java", "JVM, JDK, and your first program.", 1);
        persistLesson(courseJava, "Classes and objects", "Fields, methods, constructors.", 2);
        persistLesson(courseJava, "Collections framework", "List, Set, and Map overview.", 3);

        persistLesson(courseReact, "React project setup", "Vite, JSX, and project structure.", 1);
        persistLesson(courseReact, "State with useState", "Local state and event handling.", 2);

        persistLesson(courseSql, "SELECT and WHERE", "Filtering and sorting rows.", 1);
        persistLesson(courseSql, "JOIN operations", "Inner join and outer join patterns.", 2);

        persistLesson(courseUx, "Introduction to UX", "UX vs UI, empathy, and problem framing.", 1);
        persistLesson(courseUx, "Wireframing", "Low-fidelity layouts and iteration.", 2);

        entityManager.flush();

        Lesson javaLesson1 = findLessonByCourseAndOrder(courseJava.getId(), 1);
        Lesson javaLesson2 = findLessonByCourseAndOrder(courseJava.getId(), 2);
        Lesson reactLesson1 = findLessonByCourseAndOrder(courseReact.getId(), 1);
        Lesson sqlLesson1 = findLessonByCourseAndOrder(courseSql.getId(), 1);

        saveEnrollment(student1, courseJava);
        saveEnrollment(student1, courseReact);
        saveEnrollment(student2, courseSql);
        saveEnrollment(student2, courseJava);

        entityManager.flush();

        saveProgress(student1, javaLesson1, LessonProgressStatus.COMPLETED, 100, LocalDateTime.now().minusDays(2));
        saveProgress(student1, javaLesson2, LessonProgressStatus.IN_PROGRESS, 40, null);
        saveProgress(student1, reactLesson1, LessonProgressStatus.NOT_STARTED, 0, null);
        saveProgress(student2, sqlLesson1, LessonProgressStatus.IN_PROGRESS, 60, null);

        entityManager.flush();

        System.out.println("DbSeed completed.");
        System.out.println("Sample logins (password for all: " + SAMPLE_PASSWORD + "):");
        System.out.println("  admin@lms.local");
        System.out.println("  instructor@lms.local");
        System.out.println("  student1@lms.local");
        System.out.println("  student2@lms.local");
    }

    private Role persistRole(String name) {
        Role role = new Role();
        role.setName(name);
        entityManager.persist(role);
        return role;
    }

    private Category persistCategory(String name, String description) {
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        entityManager.persist(category);
        return category;
    }

    private User buildUser(String email, String passwordHash, String fullName, Role role) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordHash);
        user.setFullName(fullName);
        Set<Role> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);
        return user;
    }

    private Course buildCourse(String title, String description, Category category, User instructorUser) {
        Course course = new Course();
        course.setTitle(title);
        course.setDescription(description);
        course.setCategory(category);
        course.setInstructor(instructorUser);
        return course;
    }

    private void persistLesson(Course course, String title, String content, int orderIndex) {
        Lesson lesson = new Lesson();
        lesson.setCourse(course);
        lesson.setTitle(title);
        lesson.setContent(content);
        lesson.setOrderIndex(orderIndex);
        entityManager.persist(lesson);
    }

    private Lesson findLessonByCourseAndOrder(Long courseId, int orderIndex) {
        return entityManager
                .createQuery(
                        "SELECT l FROM Lesson l WHERE l.course.id = :cid AND l.orderIndex = :ord",
                        Lesson.class)
                .setParameter("cid", courseId)
                .setParameter("ord", orderIndex)
                .getSingleResult();
    }

    private void saveEnrollment(User user, Course course) {
        Enrollment enrollment = new Enrollment();
        enrollment.setUser(user);
        enrollment.setCourse(course);
        enrollment.setStatus(EnrollmentStatus.ACTIVE);
        enrollment.setEnrolledAt(LocalDateTime.now());
        enrollmentRepository.save(enrollment);
    }

    private void saveProgress(
            User user,
            Lesson lesson,
            LessonProgressStatus status,
            int progressPercent,
            LocalDateTime completedAt) {
        LessonProgress progress = new LessonProgress();
        progress.setUser(user);
        progress.setLesson(lesson);
        progress.setStatus(status);
        progress.setProgressPercent(progressPercent);
        progress.setCompletedAt(completedAt);
        entityManager.persist(progress);
    }
}

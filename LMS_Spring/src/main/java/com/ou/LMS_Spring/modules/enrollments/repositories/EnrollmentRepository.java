package com.ou.LMS_Spring.modules.enrollments.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ou.LMS_Spring.Entities.Enrollment;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    long countByCourse_Id(Long courseId);

    boolean existsByUser_IdAndCourse_Id(Long userId, Long courseId);

    List<Enrollment> findByUser_IdOrderByEnrolledAtDesc(Long userId);
    List<Enrollment> findByCourse_IdOrderByEnrolledAtDesc(Long courseId);

    @Query(value = """
        SELECT DATE(e.enrolled_at) AS day, COUNT(*) AS cnt
        FROM enrollments e
        WHERE e.enrolled_at >= :from AND e.enrolled_at < :to
        GROUP BY DATE(e.enrolled_at)
        ORDER BY day
        """, nativeQuery = true)
    List<Object[]> countEnrollmentsByDay(@Param("from") java.time.LocalDateTime from,
                                        @Param("to") java.time.LocalDateTime to);
    
    long countByCourse_Instructor_Id(Long instructorId);
}

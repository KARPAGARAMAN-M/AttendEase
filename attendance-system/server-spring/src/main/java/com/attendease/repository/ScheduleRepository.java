package com.attendease.repository;

import com.attendease.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    
    @Query("SELECT s FROM Schedule s WHERE s.department.id = :departmentId AND s.year = :year AND s.semester = :semester AND s.section = :section AND s.active = true")
    List<Schedule> findActiveSchedulesByClass(@Param("departmentId") Long departmentId, @Param("year") Integer year, @Param("semester") Integer semester, @Param("section") String section);
    
    List<Schedule> findByTeacherId(Long teacherId);
    
    List<Schedule> findBySubjectId(Long subjectId);
    
    @Query("SELECT s FROM Schedule s WHERE s.department.id = :departmentId AND s.year = :year AND s.semester = :semester")
    List<Schedule> findByDepartmentYearSemester(@Param("departmentId") Long departmentId, @Param("year") Integer year, @Param("semester") Integer semester);
}

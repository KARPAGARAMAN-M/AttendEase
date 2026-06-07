package com.attendease.repository;

import com.attendease.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    
    @Query("SELECT a FROM Attendance a WHERE a.student.id = :studentId AND a.subject.id = :subjectId AND a.attendanceDate = :date")
    Optional<Attendance> findByStudentAndSubjectAndDate(@Param("studentId") Long studentId, @Param("subjectId") Long subjectId, @Param("date") LocalDate date);
    
    List<Attendance> findByStudentId(Long studentId);
    
    List<Attendance> findByStudentIdAndSubjectId(Long studentId, Long subjectId);
    
    List<Attendance> findBySubjectId(Long subjectId);
    
    List<Attendance> findByAttendanceDateBetween(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT a FROM Attendance a WHERE a.student.id = :studentId AND a.attendanceDate BETWEEN :startDate AND :endDate")
    List<Attendance> findByStudentAndDateRange(@Param("studentId") Long studentId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}

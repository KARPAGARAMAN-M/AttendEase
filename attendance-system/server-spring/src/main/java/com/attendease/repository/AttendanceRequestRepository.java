package com.attendease.repository;

import com.attendease.entity.AttendanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceRequestRepository extends JpaRepository<AttendanceRequest, Long> {
    
    List<AttendanceRequest> findByStudentId(Long studentId);
    
    List<AttendanceRequest> findByStatus(String status);
    
    @Query("SELECT ar FROM AttendanceRequest ar WHERE ar.status = 'PENDING' AND ar.student.department.id = :departmentId")
    List<AttendanceRequest> findPendingRequestsByDepartment(@Param("departmentId") Long departmentId);
    
    @Query("SELECT ar FROM AttendanceRequest ar WHERE ar.student.id = :studentId AND ar.status = :status")
    List<AttendanceRequest> findByStudentAndStatus(@Param("studentId") Long studentId, @Param("status") String status);
}

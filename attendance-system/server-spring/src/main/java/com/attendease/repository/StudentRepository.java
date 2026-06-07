package com.attendease.repository;

import com.attendease.entity.Student;
import com.attendease.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByRollNo(String rollNo);
    Optional<Student> findByUser(User user);
    List<Student> findByDepartmentIdAndYearAndSemester(Long departmentId, Integer year, Integer semester);
    List<Student> findByDepartmentId(Long departmentId);
    boolean existsByRollNo(String rollNo);
}

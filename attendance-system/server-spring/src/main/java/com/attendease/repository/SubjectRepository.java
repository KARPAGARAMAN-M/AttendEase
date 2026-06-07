package com.attendease.repository;

import com.attendease.entity.Subject;
import com.attendease.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByDepartmentId(Long departmentId);
    List<Subject> findByDepartmentIdAndYear(Long departmentId, Integer year);
    Optional<Subject> findByNameAndDepartmentIdAndYear(String name, Long departmentId, Integer year);
    List<Subject> findByTeacherId(Long teacherId);
}

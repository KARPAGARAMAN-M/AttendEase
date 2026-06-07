package com.attendease.service;

import com.attendease.entity.Department;
import com.attendease.exception.ResourceNotFoundException;
import com.attendease.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
    }

    public Department getDepartmentByName(String name) {
        return departmentRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with name: " + name));
    }

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public Department createDepartment(String name) {
        if (departmentRepository.existsByName(name)) {
            throw new IllegalArgumentException("Department already exists");
        }

        Department department = new Department();
        department.setName(name);
        return departmentRepository.save(department);
    }

    public Department updateDepartment(Long id, String name) {
        Department department = getDepartmentById(id);

        if (!department.getName().equals(name) && departmentRepository.existsByName(name)) {
            throw new IllegalArgumentException("Department with this name already exists");
        }

        department.setName(name);
        return departmentRepository.save(department);
    }

    public void deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Department not found with id: " + id);
        }
        departmentRepository.deleteById(id);
    }
}

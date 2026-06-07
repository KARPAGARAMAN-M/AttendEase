package com.attendease.controller;

import com.attendease.entity.Department;
import com.attendease.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/departments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping("/{id}")
    public ResponseEntity<Department> getDepartmentById(@PathVariable Long id) {
        return ResponseEntity.ok(departmentService.getDepartmentById(id));
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<Department> getDepartmentByName(@PathVariable String name) {
        return ResponseEntity.ok(departmentService.getDepartmentByName(name));
    }

    @GetMapping
    public ResponseEntity<List<Department>> getAllDepartments() {
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    @PostMapping
    public ResponseEntity<Department> createDepartment(@RequestParam String name) {
        return ResponseEntity.status(HttpStatus.CREATED).body(departmentService.createDepartment(name));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Department> updateDepartment(
            @PathVariable Long id,
            @RequestParam String name) {
        return ResponseEntity.ok(departmentService.updateDepartment(id, name));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }
}

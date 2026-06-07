package com.attendease.controller;

import com.attendease.dto.StudentDTO;
import com.attendease.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/{id}")
    public ResponseEntity<StudentDTO> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @GetMapping("/roll/{rollNo}")
    public ResponseEntity<StudentDTO> getStudentByRollNo(@PathVariable String rollNo) {
        return ResponseEntity.ok(studentService.getStudentByRollNo(rollNo));
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<StudentDTO>> getStudentsByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(studentService.getStudentsByDepartment(departmentId));
    }

    @GetMapping("/class")
    public ResponseEntity<List<StudentDTO>> getStudentsByClass(
            @RequestParam Long departmentId,
            @RequestParam Integer year,
            @RequestParam Integer semester) {
        return ResponseEntity.ok(studentService.getStudentsByClass(departmentId, year, semester));
    }

    @PostMapping
    public ResponseEntity<StudentDTO> createStudent(@RequestBody StudentDTO studentDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(studentService.createStudent(studentDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentDTO> updateStudent(@PathVariable Long id, @RequestBody StudentDTO studentDTO) {
        return ResponseEntity.ok(studentService.updateStudent(id, studentDTO));
    }
}

package com.attendease.controller;

import com.attendease.dto.SubjectDTO;
import com.attendease.service.SubjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/subjects")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class SubjectController {

    private final SubjectService subjectService;

    @GetMapping("/{id}")
    public ResponseEntity<SubjectDTO> getSubjectById(@PathVariable Long id) {
        return ResponseEntity.ok(subjectService.getSubjectById(id));
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<SubjectDTO>> getSubjectsByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(subjectService.getSubjectsByDepartment(departmentId));
    }

    @GetMapping("/department/{departmentId}/year/{year}")
    public ResponseEntity<List<SubjectDTO>> getSubjectsByDepartmentAndYear(
            @PathVariable Long departmentId,
            @PathVariable Integer year) {
        return ResponseEntity.ok(subjectService.getSubjectsByDepartmentAndYear(departmentId, year));
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<SubjectDTO>> getSubjectsByTeacher(@PathVariable Long teacherId) {
        return ResponseEntity.ok(subjectService.getSubjectsByTeacher(teacherId));
    }

    @PostMapping
    public ResponseEntity<SubjectDTO> createSubject(@RequestBody SubjectDTO subjectDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(subjectService.createSubject(subjectDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubjectDTO> updateSubject(@PathVariable Long id, @RequestBody SubjectDTO subjectDTO) {
        return ResponseEntity.ok(subjectService.updateSubject(id, subjectDTO));
    }
}

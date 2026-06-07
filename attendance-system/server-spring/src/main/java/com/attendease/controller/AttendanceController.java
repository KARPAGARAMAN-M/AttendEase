package com.attendease.controller;

import com.attendease.dto.AttendanceDTO;
import com.attendease.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping
    public ResponseEntity<AttendanceDTO> markAttendance(
            @RequestParam Long studentId,
            @RequestParam Long subjectId,
            @RequestParam String date,
            @RequestParam String status,
            @RequestParam Long markedById) {
        AttendanceDTO dto = attendanceService.markAttendance(
                studentId, subjectId, LocalDate.parse(date), status, markedById);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AttendanceDTO>> getAttendanceByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByStudent(studentId));
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<AttendanceDTO>> getAttendanceBySubject(@PathVariable Long subjectId) {
        return ResponseEntity.ok(attendanceService.getAttendanceBySubject(subjectId));
    }

    @GetMapping("/student/{studentId}/subject/{subjectId}")
    public ResponseEntity<List<AttendanceDTO>> getAttendanceByStudentAndSubject(
            @PathVariable Long studentId,
            @PathVariable Long subjectId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByStudentAndSubject(studentId, subjectId));
    }

    @GetMapping("/range")
    public ResponseEntity<List<AttendanceDTO>> getAttendanceByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        return ResponseEntity.ok(attendanceService.getAttendanceByDateRange(
                LocalDate.parse(startDate), LocalDate.parse(endDate)));
    }
}

package com.attendease.service;

import com.attendease.dto.AttendanceDTO;
import com.attendease.entity.Attendance;
import com.attendease.entity.Student;
import com.attendease.entity.Subject;
import com.attendease.entity.User;
import com.attendease.exception.ResourceNotFoundException;
import com.attendease.repository.AttendanceRepository;
import com.attendease.repository.StudentRepository;
import com.attendease.repository.SubjectRepository;
import com.attendease.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;

    public AttendanceDTO markAttendance(Long studentId, Long subjectId, LocalDate date, String status, Long markedById) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        User markedBy = userRepository.findById(markedById)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if attendance already exists
        attendanceRepository.findByStudentAndSubjectAndDate(studentId, subjectId, date)
                .ifPresent(a -> {
                    throw new IllegalArgumentException("Attendance already marked for this date");
                });

        Attendance attendance = new Attendance();
        attendance.setStudent(student);
        attendance.setSubject(subject);
        attendance.setAttendanceDate(date);
        attendance.setStatus(status);
        attendance.setMarkedBy(markedBy);

        return toAttendanceDTO(attendanceRepository.save(attendance));
    }

    public List<AttendanceDTO> getAttendanceByStudent(Long studentId) {
        return attendanceRepository.findByStudentId(studentId).stream()
                .map(this::toAttendanceDTO)
                .collect(Collectors.toList());
    }

    public List<AttendanceDTO> getAttendanceBySubject(Long subjectId) {
        return attendanceRepository.findBySubjectId(subjectId).stream()
                .map(this::toAttendanceDTO)
                .collect(Collectors.toList());
    }

    public List<AttendanceDTO> getAttendanceByStudentAndSubject(Long studentId, Long subjectId) {
        return attendanceRepository.findByStudentIdAndSubjectId(studentId, subjectId).stream()
                .map(this::toAttendanceDTO)
                .collect(Collectors.toList());
    }

    public List<AttendanceDTO> getAttendanceByDateRange(LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByAttendanceDateBetween(startDate, endDate).stream()
                .map(this::toAttendanceDTO)
                .collect(Collectors.toList());
    }

    private AttendanceDTO toAttendanceDTO(Attendance attendance) {
        return AttendanceDTO.builder()
                .id(attendance.getId())
                .studentId(attendance.getStudent().getId())
                .studentName(attendance.getStudent().getUser().getName())
                .rollNo(attendance.getStudent().getRollNo())
                .subjectId(attendance.getSubject().getId())
                .subjectName(attendance.getSubject().getName())
                .attendanceDate(attendance.getAttendanceDate())
                .status(attendance.getStatus())
                .markedById(attendance.getMarkedBy() != null ? attendance.getMarkedBy().getId() : null)
                .markedByName(attendance.getMarkedBy() != null ? attendance.getMarkedBy().getName() : null)
                .build();
    }
}

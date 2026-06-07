package com.attendease.service;

import com.attendease.dto.StudentDTO;
import com.attendease.entity.Department;
import com.attendease.entity.Student;
import com.attendease.entity.User;
import com.attendease.exception.ResourceNotFoundException;
import com.attendease.repository.DepartmentRepository;
import com.attendease.repository.StudentRepository;
import com.attendease.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    public StudentDTO getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        return toStudentDTO(student);
    }

    public StudentDTO getStudentByRollNo(String rollNo) {
        Student student = studentRepository.findByRollNo(rollNo)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with rollNo: " + rollNo));
        return toStudentDTO(student);
    }

    public List<StudentDTO> getStudentsByDepartment(Long departmentId) {
        return studentRepository.findByDepartmentId(departmentId).stream()
                .map(this::toStudentDTO)
                .collect(Collectors.toList());
    }

    public List<StudentDTO> getStudentsByClass(Long departmentId, Integer year, Integer semester) {
        return studentRepository.findByDepartmentIdAndYearAndSemester(departmentId, year, semester).stream()
                .map(this::toStudentDTO)
                .collect(Collectors.toList());
    }

    public StudentDTO createStudent(StudentDTO studentDTO) {
        User user = userRepository.findById(studentDTO.getUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Department department = departmentRepository.findById(studentDTO.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        if (studentRepository.existsByRollNo(studentDTO.getRollNo())) {
            throw new IllegalArgumentException("Roll number already exists");
        }

        Student student = new Student();
        student.setUser(user);
        student.setRollNo(studentDTO.getRollNo());
        student.setDepartment(department);
        student.setYear(studentDTO.getYear());
        student.setSemester(studentDTO.getSemester());
        student.setSection(studentDTO.getSection());

        return toStudentDTO(studentRepository.save(student));
    }

    public StudentDTO updateStudent(Long id, StudentDTO studentDTO) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (studentDTO.getYear() != null) student.setYear(studentDTO.getYear());
        if (studentDTO.getSemester() != null) student.setSemester(studentDTO.getSemester());
        if (studentDTO.getSection() != null) student.setSection(studentDTO.getSection());

        return toStudentDTO(studentRepository.save(student));
    }

    private StudentDTO toStudentDTO(Student student) {
        return StudentDTO.builder()
                .id(student.getId())
                .rollNo(student.getRollNo())
                .year(student.getYear())
                .semester(student.getSemester())
                .section(student.getSection())
                .departmentId(student.getDepartment().getId())
                .departmentName(student.getDepartment().getName())
                .user(toUserDTO(student.getUser()))
                .build();
    }

    private StudentDTO.UserDTO toUserDTO(User user) {
        return new StudentDTO.UserDTO(user.getId(), user.getUsername(), user.getEmail(), user.getName(), user.getRole());
    }
}

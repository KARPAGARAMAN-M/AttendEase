package com.attendease.service;

import com.attendease.dto.SubjectDTO;
import com.attendease.entity.Department;
import com.attendease.entity.Subject;
import com.attendease.entity.User;
import com.attendease.exception.ResourceNotFoundException;
import com.attendease.repository.DepartmentRepository;
import com.attendease.repository.SubjectRepository;
import com.attendease.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    public SubjectDTO getSubjectById(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));
        return toSubjectDTO(subject);
    }

    public List<SubjectDTO> getSubjectsByDepartment(Long departmentId) {
        return subjectRepository.findByDepartmentId(departmentId).stream()
                .map(this::toSubjectDTO)
                .collect(Collectors.toList());
    }

    public List<SubjectDTO> getSubjectsByDepartmentAndYear(Long departmentId, Integer year) {
        return subjectRepository.findByDepartmentIdAndYear(departmentId, year).stream()
                .map(this::toSubjectDTO)
                .collect(Collectors.toList());
    }

    public List<SubjectDTO> getSubjectsByTeacher(Long teacherId) {
        return subjectRepository.findByTeacherId(teacherId).stream()
                .map(this::toSubjectDTO)
                .collect(Collectors.toList());
    }

    public SubjectDTO createSubject(SubjectDTO subjectDTO) {
        Department department = departmentRepository.findById(subjectDTO.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        Subject subject = new Subject();
        subject.setName(subjectDTO.getName());
        subject.setDepartment(department);
        subject.setYear(subjectDTO.getYear());

        if (subjectDTO.getTeacherId() != null) {
            User teacher = userRepository.findById(subjectDTO.getTeacherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
            subject.setTeacher(teacher);
        }

        return toSubjectDTO(subjectRepository.save(subject));
    }

    public SubjectDTO updateSubject(Long id, SubjectDTO subjectDTO) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        if (subjectDTO.getName() != null) subject.setName(subjectDTO.getName());
        if (subjectDTO.getYear() != null) subject.setYear(subjectDTO.getYear());

        if (subjectDTO.getTeacherId() != null) {
            User teacher = userRepository.findById(subjectDTO.getTeacherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
            subject.setTeacher(teacher);
        }

        return toSubjectDTO(subjectRepository.save(subject));
    }

    private SubjectDTO toSubjectDTO(Subject subject) {
        return SubjectDTO.builder()
                .id(subject.getId())
                .name(subject.getName())
                .year(subject.getYear())
                .departmentId(subject.getDepartment().getId())
                .departmentName(subject.getDepartment().getName())
                .teacherId(subject.getTeacher() != null ? subject.getTeacher().getId() : null)
                .teacherName(subject.getTeacher() != null ? subject.getTeacher().getName() : null)
                .build();
    }
}

package com.attendease.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubjectDTO {
    private Long id;
    private String name;
    private Integer year;
    private Long departmentId;
    private String departmentName;
    private Long teacherId;
    private String teacherName;
}

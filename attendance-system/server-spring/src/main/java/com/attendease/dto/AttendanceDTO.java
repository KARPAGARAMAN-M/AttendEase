package com.attendease.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private String rollNo;
    private Long subjectId;
    private String subjectName;
    private LocalDate attendanceDate;
    private String status;
    private Long markedById;
    private String markedByName;
}

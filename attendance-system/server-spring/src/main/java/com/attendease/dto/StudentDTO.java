package com.attendease.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentDTO {
    private Long id;
    private String rollNo;
    private Integer year;
    private Integer semester;
    private String section;
    private Long departmentId;
    private String departmentName;
    private UserDTO user;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDTO {
        private Long id;
        private String username;
        private String email;
        private String name;
        private String role;
    }
}

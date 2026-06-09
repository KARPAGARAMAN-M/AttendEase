package com.attendease.controller;

import com.attendease.dto.LoginRequest;
import com.attendease.dto.LoginResponse;
import com.attendease.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<HealthResponse> health() {
        return ResponseEntity.ok(new HealthResponse(true, "Java Spring Boot + MySQL", java.time.LocalDateTime.now().toString()));
    }

    public static class HealthResponse {
        public boolean ok;
        public String stack;
        public String time;

        public HealthResponse(boolean ok, String stack, String time) {
            this.ok = ok;
            this.stack = stack;
            this.time = time;
        }
    }
}

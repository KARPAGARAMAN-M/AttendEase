package com.attendease.service;

import com.attendease.dto.UserDTO;
import com.attendease.entity.User;
import com.attendease.exception.ResourceNotFoundException;
import com.attendease.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return toUserDTO(user);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toUserDTO)
                .collect(Collectors.toList());
    }

    public List<UserDTO> getUsersByRole(String role) {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole().equals(role))
                .map(this::toUserDTO)
                .collect(Collectors.toList());
    }

    private UserDTO toUserDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .build();
    }
}

package com.taskmanager.service;

import com.taskmanager.dto.AuthRequest;
import com.taskmanager.dto.AuthResponse;
import com.taskmanager.model.User;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(AuthRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getUsername())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getUsername()); // Упрощенная версия
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.USER);

        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername());
        return new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole().name());
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getUsername());
        return new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole().name());
    }
}


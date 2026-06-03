package com.askmydoc.backend.controller;

import com.askmydoc.backend.dto.UserDto;
import com.askmydoc.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/auth/register")
    public ResponseEntity<UserDto> register(@RequestBody Map<String, String> request) {
        UserDto user = userService.registerUser(
                request.get("name"),
                request.get("email"),
                request.get("password")
        );
        return ResponseEntity.ok(user);
    }

    @PostMapping("/auth/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        String token = userService.loginUser(request.get("email"), request.get("password"));
        UserDto user = userService.getProfile(request.get("email"));
        return ResponseEntity.ok(Map.of("token", token, "user", user));
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<Map<String, String>> logout() {
        userService.logoutUser();
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/users/profile")
    public ResponseEntity<UserDto> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getProfile(userDetails.getUsername()));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
}
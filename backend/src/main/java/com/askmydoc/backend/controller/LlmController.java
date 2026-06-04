package com.askmydoc.backend.controller;


import com.askmydoc.backend.dto.LlmDto;
import com.askmydoc.backend.service.LlmProviderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/llm-provider")
public class LlmController {

    @Autowired
    LlmProviderService llmProviderService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<LlmDto>> getAllProviders(@PathVariable Long userId) {
        return ResponseEntity.ok(llmProviderService.findAllProvider(userId));
    }

    @GetMapping("/user/{userId}/active")
    public ResponseEntity<List<LlmDto>> getActiveProviders(@PathVariable Long userId) {
        return ResponseEntity.ok(llmProviderService.getActiveProvider(userId));
    }

    @PostMapping("/add-llm/user/{userId}")
    public ResponseEntity<LlmDto> addProvider(@PathVariable Long userId, @RequestBody LlmDto llmDto) {
        return ResponseEntity.ok(llmProviderService.addProvider(userId, llmDto));
    }

    @PutMapping("/user/{userId}/{llmId}")
    public ResponseEntity<LlmDto> updateProvider(@PathVariable Long userId, @PathVariable Long llmId, @RequestBody LlmDto llmDto) {
        return ResponseEntity.ok(llmProviderService.updateProvider(userId, llmId, llmDto));
    }

    @PatchMapping("/user/{userId}/{llmId}/toggle")
    public ResponseEntity<LlmDto> toggleProvider(@PathVariable Long userId, @PathVariable Long llmId) {
        return ResponseEntity.ok(llmProviderService.toggleProvider(userId, llmId));
    }

    @DeleteMapping("/user/{userId}/{llmId}")
    public ResponseEntity<Void> deleteProvider(@PathVariable Long userId, @PathVariable Long llmId) {
        llmProviderService.deleteProvider(userId, llmId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}/{providerId}/token")
    public ResponseEntity<String> getDecryptedToken(@PathVariable Long userId, @PathVariable Long providerId) {
        return ResponseEntity.ok(llmProviderService.getDecryptedToken(userId, providerId));
    }
}
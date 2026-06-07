package com.askmydoc.backend.controller;


import com.askmydoc.backend.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/createChat")
    public ResponseEntity<String> createChat(@RequestParam("file")MultipartFile file, @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        String result = chatService.createChat(userDetails.getUsername(), file);
        return ResponseEntity.ok(result);
    }
}

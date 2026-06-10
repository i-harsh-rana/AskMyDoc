package com.askmydoc.backend.controller;

import com.askmydoc.backend.dto.AnswerResponseDto;
import com.askmydoc.backend.dto.ChatDto;
import com.askmydoc.backend.dto.ChatMessageDto;
import com.askmydoc.backend.dto.ChatRequestDto;
import com.askmydoc.backend.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/createChat")
    public ResponseEntity<ChatDto> createChat(@RequestParam("file") MultipartFile file, @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        ChatDto chatDto = chatService.createChat(userDetails.getUsername(), file);
        return ResponseEntity.ok(chatDto);
    }

    @PostMapping("/{chatId}/message")
    public ResponseEntity<AnswerResponseDto> sendMessage(@PathVariable Long chatId, @RequestBody ChatRequestDto request, @AuthenticationPrincipal UserDetails userDetails) {

        AnswerResponseDto response = chatService.sendMessage(chatId, userDetails.getUsername(), request.getQuestion(), request.getLlmProviderId(), request.isLlmEnabled());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{chatId}/messages")
    public ResponseEntity<List<ChatMessageDto>> getMessages(@PathVariable Long chatId, @AuthenticationPrincipal UserDetails userDetails) {

        List<ChatMessageDto> messages = chatService.getMessages(chatId, userDetails.getUsername());
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/{chatId}")
    public ResponseEntity<ChatDto> getChat(@PathVariable Long chatId, @AuthenticationPrincipal UserDetails userDetails) {

        ChatDto chat = chatService.getChat(chatId, userDetails.getUsername());
        return ResponseEntity.ok(chat);
    }

    @GetMapping
    public ResponseEntity<List<ChatDto>> getChats(@AuthenticationPrincipal UserDetails userDetails) {

        List<ChatDto> chats = chatService.getChats(userDetails.getUsername());
        return ResponseEntity.ok(chats);
    }

    @DeleteMapping("/{chatId}")
    public ResponseEntity<Void> deleteChat(@PathVariable Long chatId, @AuthenticationPrincipal UserDetails userDetails) {

        chatService.deleteChat(chatId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

}
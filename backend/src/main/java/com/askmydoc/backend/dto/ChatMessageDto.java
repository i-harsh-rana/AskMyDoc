package com.askmydoc.backend.dto;

import com.askmydoc.backend.model.ChatMessage.MessageRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {

    private Long id;
    private Long chatId;
    private MessageRole role;
    private String question;
    private String answer;
    private String llmProviderUsed;
    private LocalDateTime createdAt;
}
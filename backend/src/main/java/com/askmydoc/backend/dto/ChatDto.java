package com.askmydoc.backend.dto;

import com.askmydoc.backend.model.Chat.DocumentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatDto {

    private Long id;
    private Long userId;
    private String title;
    private DocumentStatus documentStatus;
    private LocalDateTime createdAt;
}
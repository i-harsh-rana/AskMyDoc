package com.askmydoc.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDto {

    private Long id;
    private Long chatId;
    private String fileName;
    private String originalName;
    private LocalDateTime uploadedAt;
}
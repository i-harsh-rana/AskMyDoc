package com.askmydoc.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnswerResponseDto {
    private String answer;
    private String llmProviderUsed;
    private String chatTitle;
}
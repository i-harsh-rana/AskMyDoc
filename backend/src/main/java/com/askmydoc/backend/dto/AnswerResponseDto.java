package com.askmydoc.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnswerResponseDto {
    private String ragAnswer;
    private String llmAnswer;
    private String llmProviderUsed;
}
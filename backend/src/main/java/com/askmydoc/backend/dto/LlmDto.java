package com.askmydoc.backend.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LlmDto {

    private Long id;
    private String providerName;
    private String displayName;
    private String baseUrl;
    private Boolean isActive;

}

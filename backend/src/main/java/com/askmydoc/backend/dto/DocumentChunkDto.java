package com.askmydoc.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentChunkDto {

    private Long id;
    private Long documentId;
    private int chunkIndex;
    private String content;
    private String chromaVectorId;
}
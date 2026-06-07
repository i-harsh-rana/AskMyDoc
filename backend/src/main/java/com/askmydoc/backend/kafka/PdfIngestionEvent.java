package com.askmydoc.backend.kafka;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PdfIngestionEvent {

    private Long chatId;
    private Long documentId;
    private String filePath;

}

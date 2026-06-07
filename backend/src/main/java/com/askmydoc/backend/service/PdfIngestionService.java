package com.askmydoc.backend.service;


import com.askmydoc.backend.model.Document;
import com.askmydoc.backend.model.DocumentChunk;
import com.askmydoc.backend.repository.DocumentChunkRepository;
import com.askmydoc.backend.repository.DocumentRepository;
import com.askmydoc.backend.utils.TextChunker;
import jakarta.persistence.EntityNotFoundException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class PdfIngestionService {

    @Autowired
    private DocumentRepository documentRepository;
    @Autowired
    private TextChunker textChunker;
    @Autowired
    private VectorStore vectorStore;
    @Autowired
    private DocumentChunkRepository chunkRepository;


    public void ingest(Long documentId, String filePath) throws IOException {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(()-> new EntityNotFoundException("Document not Available!"));

        String text;
        try(PDDocument pdf = Loader.loadPDF(new File(filePath))){
            text = new PDFTextStripper().getText(pdf);
        }

        List<String> chunks = textChunker.chunk(text);
        List<DocumentChunk> mySqlChunk = new ArrayList<>();
        List<org.springframework.ai.document.Document> chromaDb = new ArrayList<>();

        for(int i = 0; i<chunks.size(); i++){
            String chromaId = UUID.randomUUID().toString();

            chromaDb.add(new org.springframework.ai.document.Document(chromaId, chunks.get(i), Map.of("documentId", String.valueOf(documentId))));

            DocumentChunk chunk = new DocumentChunk();
            chunk.setChromaVectorId(chromaId);
            chunk.setDocument(doc);
            chunk.setChunkIndex(i);
            chunk.setContent(chunks.get(i));

            mySqlChunk.add(chunk);
        }

        vectorStore.add(chromaDb);
        chunkRepository.saveAll(mySqlChunk);

    }



}

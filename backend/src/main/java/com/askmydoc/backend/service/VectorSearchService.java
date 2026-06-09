package com.askmydoc.backend.service;

import com.askmydoc.backend.model.DocumentChunk;
import com.askmydoc.backend.repository.DocumentChunkRepository;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VectorSearchService {

    @Autowired
    private VectorStore vectorStore;

    @Autowired
    private DocumentChunkRepository documentChunkRepository;

    public List<DocumentChunk> search(String question, Long documentId) {

        FilterExpressionBuilder b = new FilterExpressionBuilder();

        SearchRequest request = SearchRequest.builder()
                .query(question)
                .topK(5)
                .filterExpression(
                        b.eq("documentId", documentId.toString()).build()
                )
                .build();

        List<org.springframework.ai.document.Document> results =
                vectorStore.similaritySearch(request);

        List<String> chromaIds = results.stream()
                .map(org.springframework.ai.document.Document::getId)
                .collect(Collectors.toList());

        return documentChunkRepository.findByChromaVectorIdIn(chromaIds);
    }
}
package com.askmydoc.backend.repository;

import com.askmydoc.backend.model.DocumentChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, Long> {

    List<DocumentChunk> findByDocumentIdOrderByChunkIndexAsc(Long documentId);

    Optional<DocumentChunk> findByChromaVectorId(String chromaVectorId);

    List<DocumentChunk> findByChromaVectorIdIn(List<String> chromaVectorIds);

    void deleteByDocumentId(Long documentId);
}
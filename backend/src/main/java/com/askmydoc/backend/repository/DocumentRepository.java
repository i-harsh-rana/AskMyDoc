package com.askmydoc.backend.repository;

import com.askmydoc.backend.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    Optional<Document> findByChatId(Long chatId);

    boolean existsByChatId(Long chatId);
}
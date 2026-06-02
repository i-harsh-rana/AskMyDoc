package com.askmydoc.backend.repository;

import com.askmydoc.backend.model.Chat;
import com.askmydoc.backend.model.Chat.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {

    List<Chat> findByUserId(Long userId);

    List<Chat> findByUserIdAndDocumentStatus(Long userId, DocumentStatus documentStatus);
}
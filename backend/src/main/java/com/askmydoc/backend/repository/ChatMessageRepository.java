package com.askmydoc.backend.repository;

import com.askmydoc.backend.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByChatIdOrderByCreatedAtAsc(Long chatId);

    List<ChatMessage> findTop10ByChatIdOrderByCreatedAtDesc(Long chatId);

    long countByChatId(Long chatId);

    void deleteByChatId(Long chatId);
}
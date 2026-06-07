package com.askmydoc.backend.kafka;

import com.askmydoc.backend.model.Chat;
import com.askmydoc.backend.repository.ChatRepository;
import com.askmydoc.backend.service.PdfIngestionService;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumer {

    private static final Logger log = LoggerFactory.getLogger(KafkaConsumer.class);

    @Autowired
    private ChatRepository chatRepository;
    @Autowired
    private PdfIngestionService pdfIngestionService;

    @KafkaListener(topics = "${topicNameRequest}", groupId = "${spring.kafka.consumer.group-id}")
    @Transactional
    public void consume(PdfIngestionEvent event) {
        Chat chat = chatRepository.findById(event.getChatId()).orElse(null);
        if (chat == null) {
            log.warn("Chat not found for id={}, skipping ingestion", event.getChatId());
            return;
        }

        chat.setDocumentStatus(Chat.DocumentStatus.PROCESSING);
        chatRepository.save(chat);

        try {
            pdfIngestionService.ingest(event.getDocumentId(), event.getFilePath());
            chat.setDocumentStatus(Chat.DocumentStatus.READY);
        } catch (Exception e) {
            log.error("PDF ingestion failed for documentId={}, chatId={}", event.getDocumentId(), event.getChatId(), e);
            chat.setDocumentStatus(Chat.DocumentStatus.FAILED);
        }

        chatRepository.save(chat);
    }
}
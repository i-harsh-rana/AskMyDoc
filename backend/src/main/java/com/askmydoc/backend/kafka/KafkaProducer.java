package com.askmydoc.backend.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducer {

    private static final Logger log = LoggerFactory.getLogger(KafkaProducer.class);

    @Value("${topicNameRequest}")
    private String topicNameRequest;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    public void sendIngestionEvent(PdfIngestionEvent event) {
        kafkaTemplate.send(topicNameRequest, event)
                .exceptionally(ex -> {
                    log.error("Failed to send ingestion event for chatId={}", event.getChatId(), ex);
                    return null;
                });
    }
}

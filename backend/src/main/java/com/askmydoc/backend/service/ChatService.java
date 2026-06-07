package com.askmydoc.backend.service;


import com.askmydoc.backend.kafka.KafkaProducer;
import com.askmydoc.backend.kafka.PdfIngestionEvent;
import com.askmydoc.backend.model.Chat;
import com.askmydoc.backend.model.Document;
import com.askmydoc.backend.model.User;
import com.askmydoc.backend.repository.ChatRepository;
import com.askmydoc.backend.repository.DocumentRepository;
import com.askmydoc.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ChatService {

    @Value("${app.upload-dir}")
    private String uploadDir;

    @Autowired
    private ChatRepository chatRepository;
    @Autowired
    private DocumentRepository documentRepository;
    @Autowired
    private KafkaProducer kafkaProducer;
    @Autowired
    private UserRepository userRepository;

    @Transactional
    public String createChat(String email, MultipartFile file) throws IOException {
        if (!"application/pdf".equals(file.getContentType())) {
            throw new IllegalArgumentException("Only PDF files are accepted");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + email));
        String originalName = file.getOriginalFilename() != null ? Paths.get(file.getOriginalFilename()).getFileName().toString() : "upload.pdf";
        String fileName = UUID.randomUUID() + "_" + originalName;
        Path uploadPath = Paths.get(uploadDir);
        Files.createDirectories(uploadPath);
        Path filePath = uploadPath.resolve(fileName);

        file.transferTo(filePath);

        try {
            Chat chat = new Chat();
            chat.setUser(user);
            chatRepository.save(chat);

            Document document = new Document();
            document.setChat(chat);
            document.setFileName(filePath.toString());
            document.setOriginalName(originalName);
            documentRepository.save(document);

            kafkaProducer.sendIngestionEvent(new PdfIngestionEvent(chat.getId(), document.getId(), filePath.toString()));

            return "Chat created! ID = " + chat.getId() + " | Status = PENDING";
        } catch (Exception e) {
            Files.deleteIfExists(filePath);
            throw e;
        }
    }
}
package com.askmydoc.backend.service;


import com.askmydoc.backend.dto.AnswerResponseDto;
import com.askmydoc.backend.dto.ChatDto;
import com.askmydoc.backend.dto.ChatMessageDto;
import com.askmydoc.backend.kafka.KafkaProducer;
import com.askmydoc.backend.kafka.PdfIngestionEvent;
import com.askmydoc.backend.model.*;
import com.askmydoc.backend.repository.*;
import com.askmydoc.backend.utils.PromptBuilder;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    @Autowired
    private VectorSearchService vectorSearchService;
    @Autowired
    private LlmOrchestratorService llmOrchestratorService;
    @Autowired
    private LlmProviderRepository llmProviderRepository;
    @Autowired
    private PromptBuilder promptBuilder;
    @Autowired
    private ChatClient chatClient;


    @Transactional
    public ChatDto createChat(String email, MultipartFile file) throws IOException {
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
            chat.setTitle(originalName);
            chatRepository.save(chat);

            Document document = new Document();
            document.setChat(chat);
            document.setFileName(filePath.toString());
            document.setOriginalName(originalName);
            documentRepository.save(document);

            kafkaProducer.sendIngestionEvent(new PdfIngestionEvent(chat.getId(), document.getId(), filePath.toString()));

            return toChatDto(chat);
        } catch (Exception e) {
            Files.deleteIfExists(filePath);
            throw e;
        }
    }

    @Transactional
    public AnswerResponseDto sendMessage(Long chatId, String email, String question, Long llmProviderId, boolean llmEnabled) {
        Long userId = getCurrentUserId(email);

        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new EntityNotFoundException("Chat not found"));

        if (!chat.getUser().getId().equals(userId)) {
            throw new SecurityException("Access denied to this chat");
        }

        if (chat.getDocumentStatus() != Chat.DocumentStatus.READY) {
            throw new IllegalStateException("Document is not ready yet");
        }

        Document document = documentRepository.findByChatId(chatId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found for this chat"));

        boolean isFirstMessage = chatMessageRepository.countByChatId(chatId) == 0;

        ChatMessage userMessage = new ChatMessage();
        userMessage.setChat(chat);
        userMessage.setRole(ChatMessage.MessageRole.USER);
        userMessage.setQuestion(question);
        chatMessageRepository.save(userMessage);

        List<DocumentChunk> chunks = vectorSearchService.search(question, document.getId());

        List<ChatMessage> history = chatMessageRepository.findTop10ByChatIdOrderByCreatedAtDesc(chatId);

        String prompt = promptBuilder.build(question, chunks, history);


        String answer;
        String llmProviderUsed;

        if (llmEnabled && llmProviderId != null) {
            LlmOrchestratorService.LlmResponse llmResponse = llmOrchestratorService.call(prompt, llmProviderId, userId);
            answer = llmResponse.answer();
            llmProviderUsed = llmResponse.providerDisplayName();
        }else{
            answer = chatClient.prompt().user(prompt).call().content();
            llmProviderUsed = "GPT 4o Mini";
        }

        ChatMessage assistantMessage = new ChatMessage();
        assistantMessage.setChat(chat);
        assistantMessage.setRole(ChatMessage.MessageRole.ASSISTANT);
        assistantMessage.setAnswer(answer);
        assistantMessage.setLlmProviderUsed(llmProviderUsed);
        chatMessageRepository.save(assistantMessage);

        String chatTitle = null;
        if (isFirstMessage) {
            chatTitle = generateChatTitle(chat, question, document.getOriginalName());
        }

        return new AnswerResponseDto(answer, llmProviderUsed, chatTitle);
    }

    private String generateChatTitle(Chat chat, String question, String documentName) {
        try {
            String titlePrompt = promptBuilder.buildTitlePrompt(question, documentName);
            String generatedTitle = chatClient.prompt().user(titlePrompt).call().content();
            if (generatedTitle != null) {
                generatedTitle = generatedTitle.trim().replaceAll("^[\"']|[\"']$", "");
                if (generatedTitle.length() > 255) {
                    generatedTitle = generatedTitle.substring(0, 255);
                }
                if (!generatedTitle.isBlank()) {
                    chat.setTitle(generatedTitle);
                    chatRepository.save(chat);
                    return generatedTitle;
                }
            }
        } catch (Exception e) {
        }
        return null;
    }

    public List<ChatMessageDto> getMessages(Long chatId, String email) {

        Long userId = getCurrentUserId(email);

        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new EntityNotFoundException("Chat not found"));

        if (!chat.getUser().getId().equals(userId)) {
            throw new SecurityException("Access denied to this chat");
        }

        return chatMessageRepository.findByChatIdOrderByCreatedAtAsc(chatId)
                .stream()
                .map(this::toChatMessageDto)
                .collect(Collectors.toList());
    }

    public List<ChatDto> getChats(String email) {
        Long userId = getCurrentUserId(email);
        return chatRepository.findByUserId(userId)
                .stream()
                .map(this::toChatDto)
                .collect(Collectors.toList());
    }

    public ChatDto getChat(Long chatId, String email) {
        Long userId = getCurrentUserId(email);
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new EntityNotFoundException("Chat not found"));
        if (!chat.getUser().getId().equals(userId)) {
            throw new SecurityException("Access denied to this chat");
        }
        return toChatDto(chat);
    }

    @Transactional
    public void deleteChat(Long chatId, String email) {
        Long userId = getCurrentUserId(email);
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new EntityNotFoundException("Chat not found"));
        if (!chat.getUser().getId().equals(userId)) {
            throw new SecurityException("Access denied to this chat");
        }
        chatRepository.delete(chat);
    }

    private Long getCurrentUserId(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"))
                .getId();
    }

    private ChatMessageDto toChatMessageDto(ChatMessage msg) {
        ChatMessageDto dto = new ChatMessageDto();
        dto.setId(msg.getId());
        dto.setChatId(msg.getChat().getId());
        dto.setRole(msg.getRole());
        dto.setQuestion(msg.getQuestion());
        dto.setAnswer(msg.getAnswer());
        dto.setLlmProviderUsed(msg.getLlmProviderUsed());
        dto.setCreatedAt(msg.getCreatedAt());
        return dto;
    }

    private ChatDto toChatDto(Chat chat) {
        ChatDto dto = new ChatDto();
        dto.setId(chat.getId());
        dto.setUserId(chat.getUser().getId());
        dto.setTitle(chat.getTitle());
        dto.setDocumentStatus(chat.getDocumentStatus());
        dto.setCreatedAt(chat.getCreatedAt());
        return dto;
    }
}

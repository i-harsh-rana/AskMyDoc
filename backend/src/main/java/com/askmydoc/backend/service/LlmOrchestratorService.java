package com.askmydoc.backend.service;

import com.askmydoc.backend.model.LlmProvider;
import com.askmydoc.backend.repository.LlmProviderRepository;
import com.askmydoc.backend.security.EncryptionConfig;
import com.askmydoc.backend.utils.PromptBuilder;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class LlmOrchestratorService {

    @Autowired
    private LlmProviderRepository llmProviderRepository;

    @Autowired
    private EncryptionConfig encryptionConfig;

    private final RestTemplate restTemplate = new RestTemplate();

    public record LlmResponse(String answer, String providerDisplayName) {}

    public LlmResponse call(String prompt, Long llmProviderId, Long userId) {

        LlmProvider provider = llmProviderRepository.findByIdAndUserId(llmProviderId, userId)
                .orElseThrow(() -> new EntityNotFoundException("LLM Provider not found or access denied"));

        String decryptedToken = encryptionConfig.decrypt(provider.getBearerToken());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(decryptedToken);

        Map<String, Object> requestBody = Map.of(
                "model", provider.getProviderName(),
                "messages", List.of(
                        Map.of("role", "system", "content", PromptBuilder.SYSTEM_INSTRUCTION),
                        Map.of("role", "user", "content", prompt)
                ),
                "max_tokens", 1000
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        Map response = restTemplate.postForObject(
                provider.getBaseUrl() + "/chat/completions",
                entity,
                Map.class
        );

        if (response == null) {
            throw new RuntimeException("Empty response from LLM provider");
        }

        List<Map> choices = (List<Map>) response.get("choices");
        if (choices == null || choices.isEmpty()) {
            throw new RuntimeException("LLM provider returned no choices");
        }

        Map message = (Map) choices.get(0).get("message");
        String content = message != null ? (String) message.get("content") : null;
        if (content == null) {
            throw new RuntimeException("LLM provider returned no message content");
        }

        return new LlmResponse(content, provider.getDisplayName());
    }
}
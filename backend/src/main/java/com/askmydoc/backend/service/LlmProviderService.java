package com.askmydoc.backend.service;

import com.askmydoc.backend.dto.LlmDto;
import com.askmydoc.backend.model.LlmProvider;
import com.askmydoc.backend.model.User;
import com.askmydoc.backend.repository.LlmProviderRepository;
import com.askmydoc.backend.repository.UserRepository;
import com.askmydoc.backend.security.EncryptionConfig;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LlmProviderService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LlmProviderRepository llmProviderRepository;

    @Autowired
    private EncryptionConfig encryptionConfig;

    public List<LlmDto> findAllProvider(Long userId){
        return llmProviderRepository.findByUserId(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<LlmDto> getActiveProvider(Long userId){
        return llmProviderRepository.findByUserIdAndIsActiveTrue(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public LlmDto addProvider(Long userId, LlmDto llmDto){
        if (llmDto.getBearerToken() == null || llmDto.getBearerToken().isBlank()) {
            throw new IllegalArgumentException("Bearer token is required");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found!"));

        LlmProvider llmProvider = new LlmProvider();
        llmProvider.setProviderName(llmDto.getProviderName());
        llmProvider.setDisplayName(llmDto.getDisplayName());
        llmProvider.setBaseUrl(llmDto.getBaseUrl());
        llmProvider.setIsActive(true);
        llmProvider.setUser(user);
        llmProvider.setBearerToken(encryptionConfig.encrypt(llmDto.getBearerToken()));

        return mapToDto(llmProviderRepository.save(llmProvider));
    }

    @Transactional
    public LlmDto updateProvider(Long userId, Long llmId, LlmDto request){
        LlmProvider llmProvider = llmProviderRepository.findByIdAndUserId(llmId, userId)
                .orElseThrow(()->new EntityNotFoundException("LLM Provider not found!"));

        llmProvider.setProviderName(request.getProviderName());
        llmProvider.setDisplayName(request.getDisplayName());
        llmProvider.setBaseUrl(request.getBaseUrl());

        if(request.getBearerToken()!=null && !request.getBearerToken().isBlank()){
            llmProvider.setBearerToken(encryptionConfig.encrypt(request.getBearerToken()));
        }

        return mapToDto(llmProviderRepository.save(llmProvider));
    }

    @Transactional
    public LlmDto toggleProvider(Long userId, Long llmId){
        LlmProvider llmProvider = llmProviderRepository.findByIdAndUserId(llmId, userId)
                .orElseThrow(()-> new EntityNotFoundException("LLM Provider not found"));

        llmProvider.setIsActive(!llmProvider.getIsActive());

        return mapToDto(llmProviderRepository.save(llmProvider));
    }

    @Transactional
    public void deleteProvider(Long userId, Long llmId){
        LlmProvider llmProvider = llmProviderRepository.findByIdAndUserId(llmId, userId)
                .orElseThrow(()->new EntityNotFoundException("LLM Provider not found!"));

        llmProviderRepository.delete(llmProvider);
    }

    public String getDecryptedToken(Long userId, Long providerId) {

        LlmProvider provider = llmProviderRepository
                .findByIdAndUserId(providerId, userId)
                .orElseThrow(() -> new EntityNotFoundException("LLM Provider not found"));

        return encryptionConfig.decrypt(provider.getBearerToken());
    }

    private LlmDto mapToDto(LlmProvider llmProvider){
        LlmDto llmDto = new LlmDto();
        llmDto.setId(llmProvider.getId());
        llmDto.setProviderName(llmProvider.getProviderName());
        llmDto.setIsActive(llmProvider.getIsActive());
        llmDto.setDisplayName(llmProvider.getDisplayName());
        llmDto.setBaseUrl(llmProvider.getBaseUrl());
        String decrypted = encryptionConfig.decrypt(llmProvider.getBearerToken());
        llmDto.setBearerToken(decrypted);
        return llmDto;
    }
}

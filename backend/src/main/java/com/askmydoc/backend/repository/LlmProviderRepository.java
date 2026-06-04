package com.askmydoc.backend.repository;

import com.askmydoc.backend.model.LlmProvider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LlmProviderRepository extends JpaRepository<LlmProvider, Long> {

    List<LlmProvider> findLlmByUserId(Long userId);

    List<LlmProvider> findActiveLlmByUserId(Long userId);

    Optional<LlmProvider> findByIdAndUserId(Long id, Long userId);

}

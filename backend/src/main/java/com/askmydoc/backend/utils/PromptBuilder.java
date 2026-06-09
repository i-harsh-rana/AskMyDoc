package com.askmydoc.backend.utils;

import com.askmydoc.backend.model.ChatMessage;
import com.askmydoc.backend.model.ChatMessage.MessageRole;
import com.askmydoc.backend.model.DocumentChunk;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
public class PromptBuilder {

    private static final String SYSTEM_INSTRUCTION = """
    You are a helpful assistant. Answer the user's question primarily based on the provided document context.
    If the answer is found in the document, provide a clear and accurate response based on the document.
    If the answer is not available in the document, then answer using your general knowledge while clearly mentioning that the information was not found in the document context.
    Do not make up document-specific details that are not present in the provided context.
    """;

    public String build(String question, List<DocumentChunk> chunks, List<ChatMessage> history) {

        StringBuilder prompt = new StringBuilder();

        prompt.append("### System\n");
        prompt.append(SYSTEM_INSTRUCTION);
        prompt.append("\n");

        prompt.append("### Document Context\n");
        if (chunks == null || chunks.isEmpty()) {
            prompt.append("No relevant context found.\n");
        } else {
            for (int i = 0; i < chunks.size(); i++) {
                prompt.append("Chunk ").append(i + 1).append(":\n");
                prompt.append(chunks.get(i).getContent()).append("\n\n");
            }
        }

        if (history != null && !history.isEmpty()) {
            List<ChatMessage> chronological = new ArrayList<>(history);
            Collections.reverse(chronological);

            prompt.append("### Conversation History\n");
            for (ChatMessage msg : chronological) {
                if (msg.getRole() == MessageRole.USER) {
                    prompt.append("User: ").append(msg.getQuestion()).append("\n");
                } else {
                    prompt.append("Assistant: ").append(msg.getAnswer()).append("\n");
                }
            }
            prompt.append("\n");
        }

        prompt.append("### Current Question\n");
        prompt.append(question).append("\n");

        return prompt.toString();
    }
}
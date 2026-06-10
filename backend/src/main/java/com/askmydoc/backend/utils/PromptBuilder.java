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

    public static final String SYSTEM_INSTRUCTION = """
    You are a helpful assistant answering questions about a document.

    Decide how related the question is to the document's subject matter:
    - If the question is on-topic (the document context answers it, OR it is clearly
      within the same subject area as the document), answer directly and do NOT add
      any note or disclaimer about the source.
    - If the question is unrelated / off-topic for this document, begin your reply with
      a short note such as "This is not covered in the document, but here is the answer:"
      and then answer the question fully using your general knowledge.

    Never refuse to answer, and never reply with only a message saying the information
    is not in the document. The only restriction is: do not invent specific facts,
    quotes, names, or numbers and attribute them to the document if they are not in the
    provided context.
    """;

    private static final String TITLE_INSTRUCTION = """
    You generate a short, descriptive title for a chat conversation about a document.
    Base the title on the document name and the user's first question.
    Rules:
    - Maximum 6 words.
    - Use Title Case.
    - Do not use quotation marks, punctuation at the end, or the word "title".
    - Respond with only the title text, nothing else.
    """;

    public String buildTitlePrompt(String question, String documentName) {

        StringBuilder prompt = new StringBuilder();

        prompt.append("### System\n");
        prompt.append(TITLE_INSTRUCTION);
        prompt.append("\n");

        prompt.append("### Document Name\n");
        prompt.append(documentName != null ? documentName : "Unknown document").append("\n\n");

        prompt.append("### First Question\n");
        prompt.append(question).append("\n\n");

        prompt.append("### Title\n");

        return prompt.toString();
    }

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
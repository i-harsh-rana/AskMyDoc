package com.askmydoc.backend.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class TextChunker {

    @Value("${chunker.chunk-size}")
    private int chunkSize;

    @Value("${chunker.overlap}")
    private int overlap;

    public List<String> chunk(String text) {
        if (text == null || text.isBlank()) return new ArrayList<>();

        String[] words = clean(text).split(" ");
        int step = Math.max(1, chunkSize - overlap);

        List<String> chunks = new ArrayList<>();
        for (int start = 0; start < words.length; start += step) {
            int end = Math.min(start + chunkSize, words.length);
            chunks.add(String.join(" ", Arrays.copyOfRange(words, start, end)));
            if (end == words.length) break;
        }

        return chunks;
    }

    private String clean(String text) {
        return Normalizer.normalize(text, Normalizer.Form.NFKC)
                .replaceAll("\\p{Cntrl}", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }
}
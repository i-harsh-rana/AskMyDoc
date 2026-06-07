package com.askmydoc.backend.utils;


import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class TextChunker {

    private static final int chunkSize = 500;
    private static final int overlap = 50;

    public List<String> chunk(String text){
        String[] words = text.split("\\s+");
        List<String> ans = new ArrayList<>();

        int start = 0;

        while(start< words.length){
            int end = Math.min(start+chunkSize, words.length);
            ans.add(String.join(" ", Arrays.copyOfRange(words, start, end)));
            if(end== words.length) break;
            start += (chunkSize-overlap);
        }

        return ans;
    }
}

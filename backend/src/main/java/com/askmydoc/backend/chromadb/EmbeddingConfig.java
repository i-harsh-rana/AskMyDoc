package com.askmydoc.backend.chromadb;

import org.springframework.ai.chroma.vectorstore.ChromaApi;
import org.springframework.ai.chroma.vectorstore.ChromaVectorStore;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.transformers.TransformersEmbeddingModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;

@Configuration
public class EmbeddingConfig {

    @Value("${chroma.url}")
    private String chromaUrl;
    @Value("${chroma.collection-name}")
    private String collectionName;
    @Value("${chroma.tenant}")
    private String tenant;
    @Value("${chroma.database}")
    private String database;

    @Bean
    public EmbeddingModel embeddingModel() {
        return new TransformersEmbeddingModel();
    }

    @Bean
    public ChromaApi chromaApi() {
        HttpClient httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .build();
        RestClient.Builder restClientBuilder = RestClient.builder()
                .requestFactory(new JdkClientHttpRequestFactory(httpClient));

        return ChromaApi.builder()
                .baseUrl(chromaUrl)
                .restClientBuilder(restClientBuilder)
                .build();
    }

    @Bean
    public VectorStore vectorStore(ChromaApi chromaApi, EmbeddingModel embeddingModel) {
        return ChromaVectorStore.builder(chromaApi, embeddingModel)
                .tenantName(tenant)
                .databaseName(database)
                .collectionName(collectionName)
                .initializeSchema(true)
                .build();
    }
}
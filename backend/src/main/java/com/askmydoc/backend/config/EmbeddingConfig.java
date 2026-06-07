package com.askmydoc.backend.config;

import org.springframework.ai.chroma.vectorstore.ChromaApi;
import org.springframework.ai.chroma.vectorstore.ChromaVectorStore;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.transformers.TransformersEmbeddingModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;

@Configuration
public class EmbeddingConfig {

    private static final String COLLECTION_NAME = "rag_chunks";
    private static final String CHROMA_URL = "http://localhost:8000";
    private static final String TENANT = "default_tenant";
    private static final String DATABASE = "default_database";

    @Bean
    public EmbeddingModel embeddingModel() throws Exception {
        TransformersEmbeddingModel model = new TransformersEmbeddingModel();
        model.afterPropertiesSet();
        return model;
    }

    @Bean
    public ChromaApi chromaApi() {
        HttpClient httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .build();
        RestClient.Builder restClientBuilder = RestClient.builder()
                .requestFactory(new JdkClientHttpRequestFactory(httpClient));

        return ChromaApi.builder()
                .baseUrl(CHROMA_URL)
                .restClientBuilder(restClientBuilder)
                .build();
    }

    @Bean
    public VectorStore vectorStore(ChromaApi chromaApi, EmbeddingModel embeddingModel) {
        try {
            chromaApi.getCollection(TENANT, DATABASE, COLLECTION_NAME);
        } catch (Exception e) {
            chromaApi.createCollection(TENANT, DATABASE, new ChromaApi.CreateCollectionRequest(COLLECTION_NAME));
        }

        return ChromaVectorStore.builder(chromaApi, embeddingModel)
                .tenantName(TENANT)
                .databaseName(DATABASE)
                .collectionName(COLLECTION_NAME)
                .initializeSchema(false)
                .build();
    }
}
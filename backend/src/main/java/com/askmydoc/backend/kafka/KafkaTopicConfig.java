package com.askmydoc.backend.kafka;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    @Value("${topicNameRequest}")
    private String topicNameRequest;

    @Value("${topicNameComplete}")
    private String topicNameComplete;

    @Bean
    public NewTopic ingestionRequest() {
        return TopicBuilder.name(topicNameRequest)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic ingestionComplete() {
        return TopicBuilder.name(topicNameComplete)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
package com.playmatch.playmatch.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.playmatch.playmatch.dto.ChatMessageResponseDto;
import com.playmatch.playmatch.service.RedisSubscriber;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import org.springframework.context.annotation.Profile;

@Profile("!test")
@Configuration
public class RedisConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return objectMapper;
    }

    /**
     * Redis에 메시지를 발행(publish)하기 위한 RedisTemplate 설정
     * 직렬화 방식을 JSON으로 설정하여 DTO 객체를 직접 전송할 수 있도록 합니다.
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory, ObjectMapper objectMapper) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());

        // 값 직렬화에 GenericJackson2JsonRedisSerializer 사용 (권장 방식)
        GenericJackson2JsonRedisSerializer jsonRedisSerializer = new GenericJackson2JsonRedisSerializer(objectMapper);

        template.setValueSerializer(jsonRedisSerializer);
        return template;
    }

    /**
     * Redis의 채널(토픽)로부터 메시지를 구독(subscribe)할 수 있도록 리스너를 등록하는 컨테이너
     */
    /**
     * Redis의 채널(토픽)로부터 메시지를 구독(subscribe)할 수 있도록 리스너를 등록하는 컨테이너
     * 실제 구독자(RedisSubscriber)와 리스너를 연결하고, 어떤 채널을 구독할지 설정합니다.
     */
    @Bean
    public RedisMessageListenerContainer redisMessageListener(RedisConnectionFactory connectionFactory,
                                                              MessageListenerAdapter listenerAdapter) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        // "chat-channel"이라는 채널을 구독하고, 메시지가 오면 listenerAdapter가 처리하도록 설정
        container.addMessageListener(listenerAdapter, new ChannelTopic("chat-channel"));
        return container;
    }

    /**
     * 메시지 리스너 어댑터.
     * Redis로부터 메시지를 수신했을 때, 실제 비즈니스 로직을 수행할 RedisSubscriber의 sendMessage 메소드를 호출하도록 설정합니다.
     */
    @Bean
    public MessageListenerAdapter listenerAdapter(RedisSubscriber subscriber) {
        // RedisSubscriber 클래스의 "sendMessage" 메소드를 리스너의 메시지 처리 메소드로 지정
        return new MessageListenerAdapter(subscriber, "sendMessage");
    }
}
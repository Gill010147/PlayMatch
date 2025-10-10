package com.playmatch.playmatch.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.playmatch.playmatch.dto.ChatMessageResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

@Slf4j
@RequiredArgsConstructor
@Service
public class RedisSubscriber {

    private final ObjectMapper objectMapper;
    private final SimpMessageSendingOperations messagingTemplate;

    /**
     * Redis에서 메시지가 발행(publish)되면, 구독자(subscriber)가 해당 메시지를 받아 처리합니다.
     */
    public void sendMessage(String publishMessage) {
        try {
            // Redis에서 받은 JSON 문자열을 ChatMessageResponseDto 객체로 변환
            ChatMessageResponseDto chatMessage = objectMapper.readValue(publishMessage, ChatMessageResponseDto.class);

            // WebSocket 구독자에게 채팅 메시지 전송
            // /sub/chat/room/{roomId} 토픽을 구독하는 클라이언트에게 메시지를 보냅니다.
            messagingTemplate.convertAndSend("/sub/chat/room/" + chatMessage.getRoomId(), chatMessage);
            log.info("Redis-to-WebSocket message sent to room {}", chatMessage.getRoomId());

        } catch (Exception e) {
            log.error("Exception occurred while processing message from Redis", e);
        }
    }
}

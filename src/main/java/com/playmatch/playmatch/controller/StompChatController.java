package com.playmatch.playmatch.controller;

import com.playmatch.playmatch.dto.ChatMessageRequestDto;
import com.playmatch.playmatch.dto.ChatMessageResponseDto;
import com.playmatch.playmatch.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

@Profile("!test") // 'test' 프로필이 아닐 때만 이 컨트롤러를 활성화합니다.
@Controller
@RequiredArgsConstructor
public class StompChatController {

    private final ChatService chatService;
    private final RedisTemplate<String, Object> redisTemplate; // SimpMessagingTemplate 대신 RedisTemplate 주입

    @MessageMapping("/chat/message")
    public void sendMessage(@Payload ChatMessageRequestDto requestDto, SimpMessageHeaderAccessor headerAccessor) {
        Authentication authentication = (Authentication) headerAccessor.getSessionAttributes().get("user");
        if (authentication == null) {
            throw new IllegalStateException("Cannot send message without authenticated user. User not found in session attributes.");
        }
        String username = authentication.getName();
        ChatMessageResponseDto message = chatService.saveMessage(requestDto, username);

        // Redis의 "chat-channel"로 메시지 발행
        redisTemplate.convertAndSend("chat-channel", message);
    }
}

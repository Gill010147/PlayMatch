package com.playmatch.playmatch.controller;

import com.playmatch.playmatch.dto.ChatMessageRequestDto;
import com.playmatch.playmatch.dto.ChatMessageResponseDto;
import com.playmatch.playmatch.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Profile("!test") // 'test' 프로필이 아닐 때만 이 컨트롤러를 활성화합니다.
@Controller
@RequiredArgsConstructor
public class StompChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/message")
    public void sendMessage(@Payload ChatMessageRequestDto requestDto) {
        ChatMessageResponseDto message = chatService.saveMessage(requestDto);
        messagingTemplate.convertAndSend("/sub/chat/room/" + requestDto.getRoomId(), message);
    }
}
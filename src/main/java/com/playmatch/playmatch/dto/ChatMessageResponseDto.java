package com.playmatch.playmatch.dto;

import com.playmatch.playmatch.domain.ChatMessage;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ChatMessageResponseDto {

    private final Long messageId;
    private final Long roomId; // 추가
    private final Integer senderId;
    private final String senderName;
    private final String message;
    private final LocalDateTime createdAt;

    public ChatMessageResponseDto(ChatMessage chatMessage) {
        this.messageId = chatMessage.getId();
        this.roomId = chatMessage.getChatRoom().getId(); // 추가
        this.senderId = chatMessage.getSender().getId();
        this.senderName = chatMessage.getSender().getName();
        this.message = chatMessage.getMessage();
        this.createdAt = chatMessage.getCreatedAt();
    }
}

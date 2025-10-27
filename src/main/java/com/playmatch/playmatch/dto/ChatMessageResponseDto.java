package com.playmatch.playmatch.dto;

import com.playmatch.playmatch.domain.ChatMessage;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(force = true) // Jackson 역직렬화를 위해 추가
@AllArgsConstructor // 모든 필드를 포함하는 생성자 추가
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

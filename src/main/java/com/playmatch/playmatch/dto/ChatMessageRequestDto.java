package com.playmatch.playmatch.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessageRequestDto {
    private Long roomId;
    private String senderEmail; // 발신자 이메일 추가
    private String message;
}

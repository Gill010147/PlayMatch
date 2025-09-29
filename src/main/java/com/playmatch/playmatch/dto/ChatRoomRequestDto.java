package com.playmatch.playmatch.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatRoomRequestDto {
    private String otherUserEmail; // The email of the other user to start a chat with..
}

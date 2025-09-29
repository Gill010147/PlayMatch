package com.playmatch.playmatch.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.playmatch.playmatch.domain.ChatRoom;
import com.playmatch.playmatch.domain.User;
import lombok.Getter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
public class ChatRoomResponseDto {

    @JsonProperty("roomId")
    private final Long roomId;
    private final List<ParticipantDto> participants;

    public ChatRoomResponseDto(ChatRoom chatRoom) {
        this.roomId = chatRoom.getId();
        this.participants = chatRoom.getMembers().stream()
                .map(member -> new ParticipantDto(member.getUser()))
                .collect(Collectors.toList());
    }

    @Getter
    private static class ParticipantDto {
        private final Integer userId;
        private final String name;

        public ParticipantDto(User user) {
            this.userId = user.getId();
            this.name = user.getName();
        }
    }
}

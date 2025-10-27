package com.playmatch.playmatch.dto;

import com.playmatch.playmatch.domain.ChatRoom;
import com.playmatch.playmatch.domain.User;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Optional;

@Getter
public class ChatRoomResponseDto {

    private final Long id;
    private final String name;
    private final LocalDateTime lastMessageAt;

    public ChatRoomResponseDto(ChatRoom chatRoom, User currentUser, LocalDateTime lastMessageAt) {
        this.id = chatRoom.getId();
        this.lastMessageAt = lastMessageAt; // 마지막 메시지 시간으로 설정

        if (chatRoom.getName() != null && !chatRoom.getName().isEmpty()) {
            this.name = chatRoom.getName(); // 그룹 채팅방의 경우
        } else { // 1:1 채팅방의 경우 상대방 이름으로 설정
            Optional<User> otherUser = chatRoom.getMembers().stream()
                    .map(member -> member.getUser())
                    .filter(user -> !user.getId().equals(currentUser.getId()))
                    .findFirst();
            this.name = otherUser.map(User::getName).orElse("알 수 없는 상대");
        }
    }
}

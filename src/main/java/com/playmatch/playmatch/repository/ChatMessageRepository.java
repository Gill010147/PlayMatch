package com.playmatch.playmatch.repository;

import com.playmatch.playmatch.domain.ChatMessage;
import com.playmatch.playmatch.domain.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findAllByChatRoomOrderByCreatedAtAsc(ChatRoom chatRoom);

    long countByChatRoomAndCreatedAtAfter(ChatRoom chatRoom, LocalDateTime timestamp);

    Optional<ChatMessage> findTopByChatRoomOrderByCreatedAtDesc(ChatRoom chatRoom);
}

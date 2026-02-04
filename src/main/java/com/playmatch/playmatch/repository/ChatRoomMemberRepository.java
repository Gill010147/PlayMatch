package com.playmatch.playmatch.repository;

import com.playmatch.playmatch.domain.ChatRoom;
import com.playmatch.playmatch.domain.ChatRoomMember;
import com.playmatch.playmatch.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatRoomMemberRepository extends JpaRepository<ChatRoomMember, Long> {

    @Query("SELECT crm FROM ChatRoomMember crm " +
           "JOIN FETCH crm.chatRoom cr " +
           "JOIN FETCH cr.members crm2 " +
           "JOIN FETCH crm2.user " +
           "WHERE crm.user = :user")
    List<ChatRoomMember> findAllByUserWithChatRoomAndMembers(@Param("user") User user);

    @Query("SELECT cr FROM ChatRoom cr " +
           "WHERE (SELECT COUNT(m.id) FROM cr.members m) = 2 " +
           "  AND EXISTS (SELECT m FROM cr.members m WHERE m.user.id = :user1Id) " +
           "  AND EXISTS (SELECT m FROM cr.members m WHERE m.user.id = :user2Id)")
    Optional<ChatRoom> findExistingChatRoom(@Param("user1Id") Integer user1Id, @Param("user2Id") Integer user2Id);

    Optional<ChatRoomMember> findByChatRoomAndUser(ChatRoom chatRoom, User user);
}

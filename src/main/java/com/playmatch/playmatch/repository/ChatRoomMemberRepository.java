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

    List<ChatRoomMember> findAllByUser(User user);

    @Query("SELECT crm1.chatRoom FROM ChatRoomMember crm1 " +
           "JOIN crm1.chatRoom cr " +
           "JOIN cr.members crm2 " +
           "WHERE crm1.user.id = :user1Id AND crm2.user.id = :user2Id " +
           "AND (SELECT COUNT(m) FROM cr.members m) = 2")
    Optional<ChatRoom> findExistingChatRoom(@Param("user1Id") Integer user1Id, @Param("user2Id") Integer user2Id);
}

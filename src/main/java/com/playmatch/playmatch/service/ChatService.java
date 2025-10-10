package com.playmatch.playmatch.service;

import com.playmatch.playmatch.domain.ChatMessage;
import com.playmatch.playmatch.domain.ChatRoom;
import com.playmatch.playmatch.domain.ChatRoomMember;
import com.playmatch.playmatch.domain.User;
import com.playmatch.playmatch.dto.ChatMessageRequestDto;
import com.playmatch.playmatch.dto.ChatMessageResponseDto;
import com.playmatch.playmatch.dto.ChatRoomResponseDto;
import com.playmatch.playmatch.repository.ChatMessageRepository;
import com.playmatch.playmatch.repository.ChatRoomMemberRepository;
import com.playmatch.playmatch.repository.ChatRoomRepository;
import com.playmatch.playmatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomMemberRepository chatRoomMemberRepository;
    private final UserRepository userRepository;

    @Transactional
    public ChatRoomResponseDto findOrCreateRoom(Integer otherUserId, String myEmail) {
        User me = userRepository.findByEmail(myEmail)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        User other = userRepository.findById(otherUserId)
                .orElseThrow(() -> new IllegalArgumentException("상대방 사용자를 찾을 수 없습니다."));

        // Check if a 1:1 chat room already exists
        Optional<ChatRoom> existingRoom = chatRoomMemberRepository.findExistingChatRoom(me.getId(), other.getId());

        if (existingRoom.isPresent()) {
            return new ChatRoomResponseDto(existingRoom.get(), me);
        } else {
            // Create a new chat room
            ChatRoom newRoom = ChatRoom.builder()
                    .name(other.getName())
                    .build();

            ChatRoomMember myMember = ChatRoomMember.builder().user(me).build();
            ChatRoomMember otherMember = ChatRoomMember.builder().user(other).build();

            newRoom.addMember(myMember);
            newRoom.addMember(otherMember);

            ChatRoom savedRoom = chatRoomRepository.saveAndFlush(newRoom);
            return new ChatRoomResponseDto(savedRoom, me);
        }
    }

    @Transactional
    public void updateLastReadTime(Long roomId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다."));

        ChatRoomMember member = chatRoomMemberRepository.findByChatRoomAndUser(chatRoom, user)
                .orElseThrow(() -> new IllegalArgumentException("채팅방의 멤버가 아닙니다."));

        member.updateLastReadAt();
    }

    @Transactional(readOnly = true)
    public int getUnreadMessageCount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        List<ChatRoomMember> memberships = chatRoomMemberRepository.findAllByUser(user);

        int totalUnreadCount = 0;
        for (ChatRoomMember member : memberships) {
            if (member.getLastReadAt() != null) {
                totalUnreadCount += chatMessageRepository.countByChatRoomAndCreatedAtAfter(member.getChatRoom(), member.getLastReadAt());
            }
            // lastReadAt이 null인 경우는 사용자가 방에 들어간 적이 없거나, 생성 직후인 경우로, 모든 메시지가 안 읽은 상태.
            // 하지만 생성자에서 now()로 초기화하므로 이 경우는 거의 없음. 만약을 위해 null 체크.
        }
        return totalUnreadCount;
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponseDto> getMessages(Long roomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다."));

        List<ChatMessage> messages = chatMessageRepository.findAllByChatRoomOrderByCreatedAtAsc(chatRoom);

        return messages.stream()
                .map(ChatMessageResponseDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ChatRoomResponseDto> getMyRooms(String myEmail) {
        User me = userRepository.findByEmail(myEmail)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return chatRoomMemberRepository.findAllByUser(me).stream()
                .map(ChatRoomMember::getChatRoom)
                .map(chatRoom -> new ChatRoomResponseDto(chatRoom, me))
                .collect(Collectors.toList());
    }

    @Transactional
    public ChatMessageResponseDto saveMessage(ChatMessageRequestDto requestDto, String senderEmail) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        ChatRoom chatRoom = chatRoomRepository.findById(requestDto.getRoomId())
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다."));

        ChatMessage chatMessage = ChatMessage.builder()
                .chatRoom(chatRoom)
                .sender(sender)
                .message(requestDto.getMessage())
                .build();

        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);
        return new ChatMessageResponseDto(savedMessage);
    }
}

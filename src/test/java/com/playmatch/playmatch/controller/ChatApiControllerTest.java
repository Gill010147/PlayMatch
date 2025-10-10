package com.playmatch.playmatch.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.playmatch.playmatch.domain.*;
import com.playmatch.playmatch.dto.ChatRoomRequestDto;
import com.playmatch.playmatch.repository.ChatMessageRepository;
import com.playmatch.playmatch.repository.ChatRoomMemberRepository;
import com.playmatch.playmatch.repository.ChatRoomRepository;
import com.playmatch.playmatch.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.playmatch.playmatch.BaseTest;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ChatApiControllerTest extends BaseTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private ChatRoomRepository chatRoomRepository;
    @Autowired private ChatRoomMemberRepository chatRoomMemberRepository;
    @Autowired private ChatMessageRepository chatMessageRepository;

    private User user1;
    private User user2;
    private User user3;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        String encodedPassword = passwordEncoder.encode("password");

        user1 = User.builder().email("user1@test.com").password(encodedPassword).name("유저1").role(UserRoleEnum.USER).build();
        user2 = User.builder().email("user2@test.com").password(encodedPassword).name("유저2").role(UserRoleEnum.USER).build();
        user3 = User.builder().email("user3@test.com").password(encodedPassword).name("유저3").role(UserRoleEnum.USER).build();

        userRepository.save(user1);
        userRepository.save(user2);
        userRepository.save(user3);
        // EntityManager flush 추가
        if (entityManager != null) {
            entityManager.flush();
            entityManager.clear();
        }
    }

    @Test
    @DisplayName("1:1 채팅방 생성 성공")
    @WithMockUser(username = "user1@test.com", roles = "USER")
    void findOrCreateRoom_Success_NewRoom() throws Exception {
        // given
        ChatRoomRequestDto requestDto = new ChatRoomRequestDto();
        requestDto.setParticipantId(user2.getId());
        String requestBody = objectMapper.writeValueAsString(requestDto);

        // when & then
        mockMvc.perform(post("/api/chat/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andDo(print())  // 추가!
                .andExpect(status().isOk());
//                .andExpect(jsonPath("$.roomId").exists())
//                .andExpect(jsonPath("$.participants", hasSize(2)))
//                .andExpect(jsonPath("$.participants[?(@.name == '유저1')]").exists())
//                .andExpect(jsonPath("$.participants[?(@.name == '유저2')]").exists());

        assertThat(chatRoomRepository.count()).isEqualTo(1);
        assertThat(chatRoomMemberRepository.count()).isEqualTo(2);
    }

    @Test
    @DisplayName("기존 1:1 채팅방 조회 성공")
    @WithMockUser(username = "user1@test.com", roles = "USER")
    void findOrCreateRoom_Success_ExistingRoom() throws Exception {
        // given: create a room beforehand
        ChatRoom existingRoom = ChatRoom.builder().build();
        ChatRoomMember member1 = ChatRoomMember.builder().user(user1).build();
        ChatRoomMember member2 = ChatRoomMember.builder().user(user2).build();
        existingRoom.addMember(member1);
        existingRoom.addMember(member2);
        chatRoomRepository.save(existingRoom);

        if (entityManager != null) {
            entityManager.flush();
            entityManager.clear();
        }

        ChatRoomRequestDto requestDto = new ChatRoomRequestDto();
        requestDto.setParticipantId(user2.getId());
        String requestBody = objectMapper.writeValueAsString(requestDto);

        // when & then
        mockMvc.perform(post("/api/chat/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andDo(print())
                .andExpect(status().isOk());
                // .andExpect(jsonPath("$.roomId").value(existingRoom.getId()));
    }

    @Test
    @DisplayName("과거 메시지 조회 성공")
    @WithMockUser(username = "user1@test.com", roles = "USER")
    void getMessages_Success() throws Exception {
        // given: create a room and some messages
        ChatRoom room = ChatRoom.builder().build();
        ChatRoomMember member1 = ChatRoomMember.builder().user(user1).chatRoom(room).build();
        ChatRoomMember member2 = ChatRoomMember.builder().user(user2).chatRoom(room).build();
        chatRoomRepository.save(room);
        chatRoomMemberRepository.save(member1);
        chatRoomMemberRepository.save(member2);

        ChatMessage message1 = ChatMessage.builder().chatRoom(room).sender(user1).message("안녕하세요").build();
        ChatMessage message2 = ChatMessage.builder().chatRoom(room).sender(user2).message("네, 안녕하세요").build();
        chatMessageRepository.save(message1);
        chatMessageRepository.save(message2);

        // when & then
        mockMvc.perform(get("/api/chat/rooms/" + room.getId() + "/messages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].message").value("안녕하세요"))
                .andExpect(jsonPath("$[1].senderName").value("유저2"));
    }

    @Test
    @DisplayName("내 채팅방 목록 조회 성공")
    @WithMockUser(username = "user1@test.com", roles = "USER")
    void getMyRooms_Success() throws Exception {
        // given: user1 is in two separate rooms with user2 and user3
        ChatRoom room1 = ChatRoom.builder().build();
        room1.addMember(ChatRoomMember.builder().user(user1).build());
        room1.addMember(ChatRoomMember.builder().user(user2).build());
        chatRoomRepository.save(room1);

        ChatRoom room2 = ChatRoom.builder().build();
        room2.addMember(ChatRoomMember.builder().user(user1).build());
        room2.addMember(ChatRoomMember.builder().user(user3).build());
        chatRoomRepository.save(room2);

        // when & then
        mockMvc.perform(get("/api/chat/my-rooms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }
}

package com.playmatch.playmatch.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.playmatch.playmatch.domain.User;
import com.playmatch.playmatch.domain.UserRoleEnum;
import com.playmatch.playmatch.dto.ProfileRequestDto;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private UserRepository userRepository;

    private User user1;
    private User user2;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        String encodedPassword = passwordEncoder.encode("password");
        user1 = User.builder()
                .email("user1@test.com")
                .password(encodedPassword)
                .name("유저1")
                .area("서울")
                .age("20대")
                .gender("남성")
                .playStyle("매너")
                .position("공격수")
                .role(UserRoleEnum.USER)
                .build();

        user2 = User.builder()
                .email("user2@test.com")
                .password(encodedPassword)
                .name("유저2")
                .area("부산")
                .age("30대")
                .gender("여성")
                .playStyle("열정")
                .position("수비수")
                .role(UserRoleEnum.USER)
                .build();

        userRepository.save(user1);
        userRepository.save(user2);
    }

    @Test
    @DisplayName("내 프로필 조회 성공")
    @WithMockUser(username = "user1@test.com", roles = "USER")
    void getMyProfile_Success() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("user1@test.com"))
                .andExpect(jsonPath("$.name").value("유저1"))
                .andExpect(jsonPath("$.area").value("서울"));
    }

    @Test
    @DisplayName("내 프로필 수정 성공")
    @WithMockUser(username = "user1@test.com", roles = "USER")
    void updateMyProfile_Success() throws Exception {
        // given
        ProfileRequestDto requestDto = new ProfileRequestDto();
        requestDto.setName("수정된유저1");
        requestDto.setArea("경기");
        requestDto.setAge("20대");
        requestDto.setGender("남성");
        requestDto.setPlayStyle("테크니션");
        requestDto.setPosition("미드필더");

        String requestBody = objectMapper.writeValueAsString(requestDto);

        // when & then
        mockMvc.perform(put("/api/profiles/me") // Changed URL
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(content().string("프로필이 성공적으로 수정되었습니다."));

        // Verify the changes in the database
        User updatedUser = userRepository.findByEmail("user1@test.com").orElseThrow();
        assertEquals("수정된유저1", updatedUser.getName());
        assertEquals("경기", updatedUser.getArea());
        assertEquals("미드필더", updatedUser.getPosition());
    }

    @Test
    @DisplayName("다른 사용자 프로필 조회 성공")
    @WithMockUser(username = "user1@test.com", roles = "USER")
    void getUserProfile_Success() throws Exception {
        // when & then
        mockMvc.perform(get("/api/profiles/users/" + user2.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("user2@test.com"))
                .andExpect(jsonPath("$.name").value("유저2"))
                .andExpect(jsonPath("$.area").value("부산"));
    }
}
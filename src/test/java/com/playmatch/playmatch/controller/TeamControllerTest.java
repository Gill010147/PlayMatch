package com.playmatch.playmatch.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.playmatch.playmatch.domain.Team;
import com.playmatch.playmatch.domain.TeamMember;
import com.playmatch.playmatch.domain.User;
import com.playmatch.playmatch.domain.UserRoleEnum;
import com.playmatch.playmatch.dto.TeamRequestDto;
import com.playmatch.playmatch.repository.TeamMemberRepository;
import com.playmatch.playmatch.repository.TeamRepository;
import com.playmatch.playmatch.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import org.springframework.mock.web.MockMultipartFile;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.playmatch.playmatch.BaseTest;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class TeamControllerTest extends BaseTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;
    private User anotherUser;
    private Team testTeam;

    @BeforeEach
    void setUp() {
        // 1. User 먼저 생성
        testUser = User.builder()
                .email("testuser@example.com")
                .password(passwordEncoder.encode("password"))
                .name("testuser")
                .role(UserRoleEnum.USER)
                .build();

        anotherUser = User.builder()
                .email("anotheruser@example.com")
                .password(passwordEncoder.encode("password"))
                .name("anotherUser")
                .role(UserRoleEnum.USER)
                .build();

        testUser = userRepository.save(testUser);
        anotherUser = userRepository.save(anotherUser);

        // 2. Team 생성
        testTeam = Team.builder()
                .leader(testUser)
                .name("Original Team Name")
                .introduce("Original Intro")
                .mainArea("Seoul")
                .build();
        testTeam = teamRepository.save(testTeam);

        // 3. TeamMember 생성
        TeamMember member = TeamMember.builder()
                .user(testUser)
                .team(testTeam)
                .build();
        teamMemberRepository.save(member);

        // EntityManager flush
        if (entityManager != null) {
            entityManager.flush();
            entityManager.clear();
        }
    }

    @Test
    @DisplayName("팀 생성 성공")
    void createTeam_Success() throws Exception {
        TeamRequestDto requestDto = new TeamRequestDto();
        requestDto.setName("FC 테스트");
        requestDto.setIntroduce("테스트 팀입니다.");
        requestDto.setMainArea("서울");
        String requestBody = objectMapper.writeValueAsString(requestDto);

        mockMvc.perform(multipart("/api/teams")
                        .file(new MockMultipartFile("requestDto", "", MediaType.APPLICATION_JSON_VALUE, requestBody.getBytes()))
                        .with(user(anotherUser.getEmail()).roles("USER")))
                .andDo(print())  // 추가 - 에러 메시지 확인
                .andExpect(status().isCreated())
                .andExpect(content().string("팀 생성 완료"));
    }

    @Test
    @DisplayName("내 팀 목록 조회 성공")
    void getMyTeams_Success() throws Exception {
        mockMvc.perform(get("/api/teams/my")
                        .with(user(testUser.getEmail()).roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Original Team Name")));
    }

    @Test
    @DisplayName("특정 팀 정보 조회 성공")
    void getTeam_Success() throws Exception {
        mockMvc.perform(get("/api/teams/" + testTeam.getId())
                        .with(user(testUser.getEmail()).roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Original Team Name")))
                .andExpect(jsonPath("$.leaderName", is(testUser.getName())));
    }

    @Test
    @DisplayName("팀 정보 수정 성공")
    void updateTeam_Success() throws Exception {
        TeamRequestDto requestDto = new TeamRequestDto();
        requestDto.setName("Updated Team Name");
        requestDto.setIntroduce("Updated Intro");
        requestDto.setMainArea("Busan");
        String requestBody = objectMapper.writeValueAsString(requestDto);

        mockMvc.perform(put("/api/teams/" + testTeam.getId())
                        .with(user(testUser.getEmail()).roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Updated Team Name")))
                .andExpect(jsonPath("$.introduce", is("Updated Intro")))
                .andExpect(jsonPath("$.leaderName", is(testUser.getName())));
    }

    @Test
    @DisplayName("팀 정보 수정 실패 - 권한 없음")
    void updateTeam_Fail_NotLeader() throws Exception {
        TeamRequestDto requestDto = new TeamRequestDto();
        requestDto.setName("Attempted Update Name");
        String requestBody = objectMapper.writeValueAsString(requestDto);

        mockMvc.perform(put("/api/teams/" + testTeam.getId())
                        .with(user(anotherUser.getEmail()).roles("USER"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isForbidden());
    }
}

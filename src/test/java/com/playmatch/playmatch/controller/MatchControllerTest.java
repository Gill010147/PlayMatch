package com.playmatch.playmatch.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.playmatch.playmatch.domain.*;
import com.playmatch.playmatch.dto.CreateMatchRequestDto;
import com.playmatch.playmatch.dto.UpdateApplicationStatusRequestDto;
import com.playmatch.playmatch.dto.UpdateMatchStatusRequestDto;
import com.playmatch.playmatch.repository.*;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class MatchControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TeamRepository teamRepository;
    @Autowired
    private TeamMemberRepository teamMemberRepository; // Added this
    @Autowired
    private MatchRepository matchRepository;
    @Autowired
    private MatchApplicationRepository matchApplicationRepository;

    private User hostLeader;
    private User applicantUser;
    private Team hostTeam;
    private Match match;

    @BeforeEach
    void setUp() {
        String encodedPassword = passwordEncoder.encode("password");
        hostLeader = User.builder().email("host@test.com").password(encodedPassword).name("호스트리더").role(UserRoleEnum.USER).build();
        applicantUser = User.builder().email("applicant@test.com").password(encodedPassword).name("지원자").role(UserRoleEnum.USER).build();
        userRepository.save(hostLeader);
        userRepository.save(applicantUser);

        hostTeam = Team.builder().leader(hostLeader).name("호스트팀").build();
        teamRepository.save(hostTeam);

        // Explicitly add leader as a team member
        TeamMember hostTeamMember = TeamMember.builder().user(hostLeader).team(hostTeam).build();
        teamMemberRepository.save(hostTeamMember);

        match = Match.builder()
                .hostTeam(hostTeam)
                .title("테스트 경기")
                .matchDate(LocalDateTime.now().plusDays(1))
                .locationName("테스트 경기장")
                .latitude(37.5665)
                .longitude(126.9780)
                .matchType(MatchType.FUTSAL_6V6)
                .maxMemberCount(12)
                .status(MatchStatus.RECRUITING)
                .build();
        matchRepository.save(match);
    }

    // ... (rest of the test methods are the same)
    @Test
    @DisplayName("경기 생성 성공")
    @WithMockUser(username = "host@test.com", roles = "USER")
    void createMatch_Success() throws Exception {
        CreateMatchRequestDto requestDto = new CreateMatchRequestDto();
        requestDto.setTitle("새로운 경기");
        requestDto.setHostTeamId(hostTeam.getId());
        requestDto.setMatchType(MatchType.FUTSAL_6V6);
        requestDto.setLocationName("테스트 경기장");
        requestDto.setLatitude(37.5665);
        requestDto.setLongitude(126.9780);
        requestDto.setMatchDate(LocalDateTime.of(LocalDate.now().plusDays(5), LocalTime.of(18, 0)));
        requestDto.setMaxMemberCount(12);
        requestDto.setDescription("즐겁게 경기해요!");

        String requestBody = objectMapper.writeValueAsString(requestDto);

        mockMvc.perform(post("/api/matches")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(content().string("경기 생성이 완료되었습니다."));
    }

    @Test
    @DisplayName("경기 목록 조회 성공")
    void getMatches_Success() throws Exception {
        mockMvc.perform(get("/api/matches"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("테스트 경기"));
    }

    @Test
    @DisplayName("경기 상세 조회 성공")
    void getMatchDetails_Success() throws Exception {
        mockMvc.perform(get("/api/matches/" + match.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("테스트 경기"))
                .andExpect(jsonPath("$.hostTeamName").value("호스트팀"));
    }

    @Test
    @DisplayName("경기에 지원 성공")
    @WithMockUser(username = "applicant@test.com", roles = "USER")
    void applyToMatch_Success() throws Exception {
        mockMvc.perform(post("/api/matches/" + match.getId() + "/participants"))
                .andExpect(status().isCreated())
                .andExpect(content().string("경기에 성공적으로 지원했습니다."));
    }

    @Test
    @DisplayName("경기에 지원 실패 - 호스트가 자신의 경기에 지원")
    @WithMockUser(username = "host@test.com", roles = "USER")
    void applyToMatch_Fail_HostApplies() throws Exception {
        mockMvc.perform(post("/api/matches/" + match.getId() + "/participants"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("경기 지원자 목록 조회 성공")
    @WithMockUser(username = "host@test.com", roles = "USER")
    void getApplicationsForMatch_Success() throws Exception {
        MatchApplication application = MatchApplication.builder().match(match).user(applicantUser).build();
        matchApplicationRepository.save(application);

        mockMvc.perform(get("/api/matches/" + match.getId() + "/participants"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].applicantName").value("지원자"));
    }

    @Test
    @DisplayName("경기 지원 상태 변경 성공")
    @WithMockUser(username = "host@test.com", roles = "USER")
    void updateMatchApplicationStatus_Success() throws Exception {
        MatchApplication application = MatchApplication.builder().match(match).user(applicantUser).build();
        matchApplicationRepository.save(application);

        UpdateApplicationStatusRequestDto requestDto = new UpdateApplicationStatusRequestDto();
        requestDto.setStatus(ApplicationStatus.ACCEPTED);
        String requestBody = objectMapper.writeValueAsString(requestDto);

        mockMvc.perform(put("/api/matches/" + match.getId() + "/applications/" + application.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(content().string("경기 지원 상태가 변경되었습니다."));
    }

    @Test
    @DisplayName("경기 상태 변경 성공")
    @WithMockUser(username = "host@test.com", roles = "USER")
    void updateMatchStatus_Success() throws Exception {
        UpdateMatchStatusRequestDto requestDto = new UpdateMatchStatusRequestDto();
        requestDto.setStatus(MatchStatus.COMPLETED);
        String requestBody = objectMapper.writeValueAsString(requestDto);

        mockMvc.perform(put("/api/matches/" + match.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(content().string("경기 상태가 변경되었습니다."));
    }
}

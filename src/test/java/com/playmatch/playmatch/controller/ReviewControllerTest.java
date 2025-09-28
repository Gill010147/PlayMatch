package com.playmatch.playmatch.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.playmatch.playmatch.domain.*;
import com.playmatch.playmatch.dto.CreateReviewRequestDto;
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

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

 @ActiveProfiles("test")
 @SpringBootTest @AutoConfigureMockMvc @Transactional
class ReviewControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private UserRepository userRepository;
    @Autowired private TeamRepository teamRepository;
    @Autowired private TeamMemberRepository teamMemberRepository;
    @Autowired private MatchRepository matchRepository;
    @Autowired private MatchApplicationRepository matchApplicationRepository;
    @Autowired private ReviewRepository reviewRepository;

    private User hostLeader;
    private User mercenary;
    private User opponentLeader;
    private Team hostTeam;
    private Team opponentTeam;
    private Match completedMatch;

    @BeforeEach
    void setUp() {
        String encodedPassword = passwordEncoder.encode("password");
        hostLeader = User.builder().email("host@test.com").password(encodedPassword).name("호스트리더").role(UserRoleEnum.USER).build();
        mercenary = User.builder().email("mercenary@test.com").password(encodedPassword).name("용병").role(UserRoleEnum.USER).build();
        opponentLeader = User.builder().email("opponent@test.com").password(encodedPassword).name("상대리더").role(UserRoleEnum.USER).build();
        userRepository.save(hostLeader);
        userRepository.save(mercenary);
        userRepository.save(opponentLeader);

        hostTeam = Team.builder().leader(hostLeader).name("호스트팀").build();
        opponentTeam = Team.builder().leader(opponentLeader).name("상대팀").build();

        TeamMember hostTeamMember = TeamMember.builder().user(hostLeader).team(hostTeam).build();
        hostTeam.addTeamMember(hostTeamMember);
        teamRepository.save(hostTeam);

        TeamMember opponentTeamMember = TeamMember.builder().user(opponentLeader).team(opponentTeam).build();
        opponentTeam.addTeamMember(opponentTeamMember);
        teamRepository.save(opponentTeam);
        
        completedMatch = Match.builder()
                .hostTeam(hostTeam).title("테스트 경기").matchDate(LocalDateTime.now().minusDays(1))
                .locationName("테스트 경기장").latitude(0.0).longitude(0.0)
                .matchType(MatchType.FUTSAL_6V6).maxMemberCount(12).status(MatchStatus.RECRUITING)
                .build();
        completedMatch.updateStatus(MatchStatus.COMPLETED);
        matchRepository.save(completedMatch);

        MatchApplication application = MatchApplication.builder().match(completedMatch).user(mercenary).build();
        application.updateStatus(ApplicationStatus.ACCEPTED);
        matchApplicationRepository.save(application);
    }

    @Test
    @DisplayName("리뷰 작성 성공")
    @WithMockUser(username = "mercenary@test.com", roles = "USER")
    void createReview_Success() throws Exception {
        CreateReviewRequestDto requestDto = new CreateReviewRequestDto();
        requestDto.setReviewedTeamId(hostTeam.getId());
        requestDto.setMatchId(completedMatch.getId());
        requestDto.setRating(5);
        requestDto.setComment("매너 좋은 팀입니다!");
        String requestBody = objectMapper.writeValueAsString(requestDto);

        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(content().string("리뷰가 성공적으로 등록되었습니다."));
    }

    @Test
    @DisplayName("리뷰 작성 실패 - 자신의 팀을 리뷰")
    @WithMockUser(username = "host@test.com", roles = "USER")
    void createReview_Fail_SelfReview() throws Exception {
        CreateReviewRequestDto requestDto = new CreateReviewRequestDto();
        requestDto.setReviewedTeamId(hostTeam.getId()); // 자신의 팀을 리뷰하도록 변경
        requestDto.setMatchId(completedMatch.getId());
        requestDto.setRating(5);
        requestDto.setComment("우리팀 최고!");
        String requestBody = objectMapper.writeValueAsString(requestDto);

        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("자신이 속한 팀은 리뷰할 수 없습니다."));
    }

    @Test
    @DisplayName("리뷰 작성 실패 - 경기에 참여하지 않은 사용자가 리뷰 작성")
    @WithMockUser(username = "opponent@test.com", roles = "USER")
    void createReview_Fail_NonParticipant() throws Exception {
        CreateReviewRequestDto requestDto = new CreateReviewRequestDto();
        requestDto.setReviewedTeamId(hostTeam.getId());
        requestDto.setMatchId(completedMatch.getId());
        requestDto.setRating(5);
        requestDto.setComment("참여도 안했는데 리뷰 작성");
        String requestBody = objectMapper.writeValueAsString(requestDto);

        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("해당 경기에 참여한 사용자만 리뷰를 작성할 수 있습니다."));
    }

    @Test
    @DisplayName("리뷰 작성 실패 - 중복 리뷰 작성")
    @WithMockUser(username = "mercenary@test.com", roles = "USER")
    void createReview_Fail_DuplicateReview() throws Exception {
        Review existingReview = Review.builder()
                .reviewer(mercenary)
                .reviewedTeam(hostTeam)
                .match(completedMatch)
                .rating(4)
                .comment("미리 작성된 리뷰")
                .build();
        reviewRepository.save(existingReview);
        
        CreateReviewRequestDto requestDto = new CreateReviewRequestDto();
        requestDto.setReviewedTeamId(hostTeam.getId());
        requestDto.setMatchId(completedMatch.getId());
        requestDto.setRating(5);
        requestDto.setComment("두 번째 리뷰");
        String requestBody = objectMapper.writeValueAsString(requestDto);

        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("이미 해당 경기에 대한 리뷰를 작성했습니다."));
    }

    @Test
    @DisplayName("팀 리뷰 목록 조회 성공")
    void getReviewsForTeam_Success() throws Exception {
        // given
        Review review = Review.builder()
                .reviewedTeam(hostTeam)
                .reviewer(mercenary)
                .match(completedMatch)
                .rating(5)
                .comment("매너가 좋은 팀입니다!")
                .build();
        reviewRepository.save(review);

        // when & then
        mockMvc.perform(get("/api/reviews/teams/" + hostTeam.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].comment").value("매너가 좋은 팀입니다!"))
                .andExpect(jsonPath("$[0].reviewerName").value("용병"));
    }

    @Test
    @DisplayName("사용자 관련 리뷰 목록 조회 성공")
    void getReviewsForUser_Success() throws Exception {
        // given
        Review review = Review.builder()
                .reviewedTeam(hostTeam)
                .reviewer(mercenary)
                .match(completedMatch)
                .rating(5)
                .comment("매너가 좋은 팀입니다!")
                .build();
        reviewRepository.save(review);

        // when & then
        // The user 'hostLeader' is a member of 'hostTeam', so this should return the review about 'hostTeam'.
        mockMvc.perform(get("/api/reviews/users/" + hostLeader.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].comment").value("매너가 좋은 팀입니다!"));
    }
}
package com.playmatch.playmatch.service;

import com.playmatch.playmatch.domain.*;
import com.playmatch.playmatch.dto.CreateReviewRequestDto;
import com.playmatch.playmatch.dto.ReviewResponseDto;
import com.playmatch.playmatch.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final MatchRepository matchRepository;
    private final MatchApplicationRepository matchApplicationRepository;
    private final TeamMemberRepository teamMemberRepository;

    @Transactional
    public void createReview(CreateReviewRequestDto requestDto, String email) {
        User reviewer = userRepository.findByEmail(email).orElseThrow(
                () -> new IllegalArgumentException("사용자를 찾을 수 없습니다.")
        );

        Team reviewedTeam = teamRepository.findById(requestDto.getReviewedTeamId()).orElseThrow(
                () -> new IllegalArgumentException("리뷰 대상 팀을 찾을 수 없습니다.")
        );

        Match match = matchRepository.findById(requestDto.getMatchId()).orElseThrow(
                () -> new IllegalArgumentException("관련 경기를 찾을 수 없습니다.")
        );

        if (match.getStatus() != MatchStatus.COMPLETED) {
            throw new IllegalArgumentException("완료된 경기에 대해서만 리뷰를 작성할 수 있습니다.");
        }

        // 1. 셀프 리뷰 방지
        if (teamMemberRepository.existsByTeamAndUser(reviewedTeam, reviewer)) {
            throw new IllegalArgumentException("자신이 속한 팀은 리뷰할 수 없습니다.");
        }

        // 2. 리뷰 대상이 주최팀인지 확인
        if (!reviewedTeam.getId().equals(match.getHostTeam().getId())) {
            throw new IllegalArgumentException("리뷰 대상 팀은 해당 경기의 주최팀이어야 합니다.");
        }

        // 2. 경기 참여자 확인 (주최팀 멤버 또는 수락된 용병)
        boolean isHostTeamMember = teamMemberRepository.existsByTeamAndUser(match.getHostTeam(), reviewer);
        boolean isAcceptedMercenary = matchApplicationRepository
                .existsByMatchAndUserAndStatus(match, reviewer, ApplicationStatus.ACCEPTED);

        if (!isHostTeamMember && !isAcceptedMercenary) {
            throw new IllegalArgumentException("해당 경기에 참여한 사용자만 리뷰를 작성할 수 있습니다.");
        }

        if (reviewRepository.existsByMatchAndReviewer(match, reviewer)) {
            throw new IllegalArgumentException("이미 해당 경기에 대한 리뷰를 작성했습니다.");
        }

        Review review = Review.builder()
                .reviewedTeam(reviewedTeam)
                .reviewer(reviewer)
                .match(match)
                .rating(requestDto.getRating())
                .comment(requestDto.getComment())
                .build();

        reviewRepository.save(review);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponseDto> getReviewsForTeam(Integer teamId) {
        Team team = teamRepository.findById(teamId).orElseThrow(
                () -> new IllegalArgumentException("팀을 찾을 수 없습니다.")
        );
        return reviewRepository.findAllByReviewedTeam(team)
                .stream()
                .map(ReviewResponseDto::new)
                .sorted(Comparator.comparing(ReviewResponseDto::getCreatedAt).reversed())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewResponseDto> getReviewsForUser(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(
                () -> new IllegalArgumentException("사용자를 찾을 수 없습니다.")
        );

        // Find all teams the user is a member of
        List<Team> userTeams = teamMemberRepository.findAllByUser(user)
                .stream()
                .map(TeamMember::getTeam)
                .collect(Collectors.toList());

        // Find all reviews for those teams
        return userTeams.stream()
                .flatMap(team -> reviewRepository.findAllByReviewedTeam(team).stream())
                .map(ReviewResponseDto::new)
                .sorted(Comparator.comparing(ReviewResponseDto::getCreatedAt).reversed())
                .distinct()
                .collect(Collectors.toList());
    }
}
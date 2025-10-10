package com.playmatch.playmatch.service;

import com.playmatch.playmatch.domain.*;
import com.playmatch.playmatch.dto.CreateMatchRequestDto;
import com.playmatch.playmatch.dto.MatchApplicationResponseDto;
import com.playmatch.playmatch.dto.MatchResponseDto;
import com.playmatch.playmatch.dto.UpdateApplicationStatusRequestDto;
import com.playmatch.playmatch.dto.UpdateMatchStatusRequestDto;
import com.playmatch.playmatch.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final MatchApplicationRepository matchApplicationRepository;
    private final TeamMemberRepository teamMemberRepository;

    @Transactional
    public void createMatch(CreateMatchRequestDto requestDto, String email) {
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new IllegalArgumentException("사용자를 찾을 수 없습니다.")
        );

        Team hostTeam = teamRepository.findById(requestDto.getHostTeamId()).orElseThrow(
                () -> new IllegalArgumentException("해당 ID의 팀을 찾을 수 없습니다: " + requestDto.getHostTeamId())
        );

        if (!Objects.equals(hostTeam.getLeader().getId(), user.getId())) {
            throw new IllegalArgumentException("경기 생성은 팀 리더만 가능합니다.");
        }

        Match match = Match.builder()
                .hostTeam(hostTeam)
                .title(requestDto.getTitle())
                .matchDate(requestDto.getMatchDate())
                .locationName(requestDto.getLocationName())
                .latitude(requestDto.getLatitude())
                .longitude(requestDto.getLongitude())
                .matchType(requestDto.getMatchType())
                .venueType(requestDto.getVenueType())
                .description(requestDto.getDescription())
                .maxMemberCount(requestDto.getMaxMemberCount())
                .status(MatchStatus.RECRUITING)
                .build();

        matchRepository.save(match);
    }

    @Transactional(readOnly = true)
    public List<MatchResponseDto> getMatches() {
        // 경기 날짜가 가까운 순으로 정렬하여 모든 경기를 조회합니다.
        List<Match> matches = matchRepository.findAll(Sort.by(Sort.Direction.ASC, "matchDate"));
        return matches.stream()
                .map(match -> {
                    // 실제 주최팀 멤버 수 + 수락된 용병 수
                    int currentHostMembers = match.getHostTeam().getMembers().size();
                    long acceptedApplicantsCount = matchApplicationRepository.countByMatchAndStatus(match, ApplicationStatus.ACCEPTED);
                    int memberCount = currentHostMembers + (int) acceptedApplicantsCount;
                    return new MatchResponseDto(match, memberCount);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MatchResponseDto getMatchDetails(Long matchId) {
        Match match = matchRepository.findById(matchId).orElseThrow(
                () -> new IllegalArgumentException("해당 ID의 경기를 찾을 수 없습니다: " + matchId)
        );

        // 실제 주최팀 멤버 수 + 수락된 용병 수
        int currentHostMembers = match.getHostTeam().getMembers().size();
        long acceptedApplicantsCount = matchApplicationRepository.countByMatchAndStatus(match, ApplicationStatus.ACCEPTED);
        int memberCount = currentHostMembers + (int) acceptedApplicantsCount;

        return new MatchResponseDto(match, memberCount);
    }

    @Transactional
    public void applyToMatch(Long matchId, String email) {
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new IllegalArgumentException("사용자를 찾을 수 없습니다.")
        );

        Match match = matchRepository.findById(matchId).orElseThrow(
                () -> new IllegalArgumentException("해당 ID의 경기를 찾을 수 없습니다: " + matchId)
        );

        if (match.getStatus() != MatchStatus.RECRUITING) {
            throw new IllegalArgumentException("모집중인 경기만 지원할 수 있습니다.");
        }

        if (teamMemberRepository.existsByTeamAndUser(match.getHostTeam(), user)) {
            throw new IllegalArgumentException("이미 소속된 팀의 경기에는 지원할 수 없습니다.");
        }

        if (matchApplicationRepository.existsByMatchAndUser(match, user)) {
            throw new IllegalArgumentException("이미 지원한 경기입니다.");
        }

        MatchApplication application = MatchApplication.builder()
                .match(match)
                .user(user)
                .build();

        matchApplicationRepository.save(application);
    }

    @Transactional(readOnly = true)
    public List<MatchApplicationResponseDto> getApplicationsForMatch(Long matchId, String email) {
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new IllegalArgumentException("사용자를 찾을 수 없습니다.")
        );

        Match match = matchRepository.findById(matchId).orElseThrow(
                () -> new IllegalArgumentException("해당 ID의 경기를 찾을 수 없습니다: " + matchId)
        );

        if (!Objects.equals(match.getHostTeam().getLeader().getId(), user.getId())) {
            throw new IllegalArgumentException("경기 지원자 목록을 조회할 권한이 없습니다.");
        }

        List<MatchApplication> applications = matchApplicationRepository.findAllByMatch(match);
        return applications.stream()
                .map(MatchApplicationResponseDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateMatchApplicationStatus(Long matchId, Long applicationId, String email, UpdateApplicationStatusRequestDto requestDto) {
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new IllegalArgumentException("사용자를 찾을 수 없습니다.")
        );

        Match match = matchRepository.findById(matchId).orElseThrow(
                () -> new IllegalArgumentException("해당 ID의 경기를 찾을 수 없습니다: " + matchId)
        );

        if (!Objects.equals(match.getHostTeam().getLeader().getId(), user.getId())) {
            throw new IllegalArgumentException("경기 지원 상태를 변경할 권한이 없습니다.");
        }

        MatchApplication application = matchApplicationRepository.findById(applicationId).orElseThrow(
                () -> new IllegalArgumentException("해당 ID의 지원서를 찾을 수 없습니다: " + applicationId)
        );

        if (!application.getMatch().getId().equals(matchId)) {
            throw new IllegalArgumentException("해당 경기의 지원서가 아닙니다.");
        }

        application.updateStatus(requestDto.getStatus());
    }

    @Transactional
    public void updateMatchStatus(Long matchId, String email, UpdateMatchStatusRequestDto requestDto) {
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new IllegalArgumentException("사용자를 찾을 수 없습니다.")
        );

        Match match = matchRepository.findById(matchId).orElseThrow(
                () -> new IllegalArgumentException("해당 ID의 경기를 찾을 수 없습니다: " + matchId)
        );

        if (!Objects.equals(match.getHostTeam().getLeader().getId(), user.getId())) {
            throw new IllegalArgumentException("경기 상태를 변경할 권한이 없습니다.");
        }

        match.updateStatus(requestDto.getStatus());
    }
}
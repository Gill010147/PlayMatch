package com.playmatch.playmatch.service;

import com.playmatch.playmatch.domain.*;
import com.playmatch.playmatch.dto.*;
import com.playmatch.playmatch.repository.TeamApplicationRepository;
import com.playmatch.playmatch.repository.TeamMemberRepository;
import com.playmatch.playmatch.repository.UserRepository;
import com.playmatch.playmatch.repository.TeamRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final TeamApplicationRepository teamApplicationRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final EntityManager entityManager;

    @Transactional
    public void createTeam(TeamRequestDto requestDto, String email) {
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new IllegalArgumentException("사용자를 찾을 수 없습니다.")
        );

        Team team = Team.builder()
                .name(requestDto.getName())
                .introduce(requestDto.getIntroduce())
                .mainArea(requestDto.getMainArea())
                .teamLogo(requestDto.getTeamLogo())
                .leader(user)
                .build();

        teamRepository.save(team);

        TeamMember teamMember = TeamMember.builder()
                .team(team)
                .user(user)
                .build();
        teamMemberRepository.save(teamMember);
    }

    @Transactional(readOnly = true)
    public List<TeamResponseDto> getMyTeams(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new IllegalArgumentException("사용자를 찾을 수 없습니다.")
        );

        List<TeamMember> teamMembers = teamMemberRepository.findAllByUser(user);
        return teamMembers.stream()
                .map(TeamMember::getTeam)
                .map(team -> TeamResponseDto.builder()
                        .id(team.getId())
                        .name(team.getName())
                        .introduce(team.getIntroduce())
                        .mainArea(team.getMainArea())
                        .teamLogo(team.getTeamLogo())
                        .leaderName(team.getLeader().getName())
                        .members(team.getMembers().stream().map(TeamMemberResponseDto::new).collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TeamResponseDto getTeam(Integer teamId) {
        Team team = teamRepository.findByIdWithLeader(teamId).orElseThrow(
            () -> new IllegalArgumentException("해당 ID의 팀을 찾을 수 없습니다: " + teamId)
        );

        System.out.println("Debug: Leader name in service: " + team.getLeader().getName()); // 디버깅용

        return TeamResponseDto.builder()
                .id(team.getId())
                .name(team.getName())
                .introduce(team.getIntroduce())
                .mainArea(team.getMainArea())
                .teamLogo(team.getTeamLogo())
                .leaderName(team.getLeader().getName())
                .members(team.getMembers().stream().map(TeamMemberResponseDto::new).collect(Collectors.toList()))
                .build();
    }

    @Transactional(readOnly = true)
    public List<TeamResponseDto> searchTeams(String keyword) {
        List<Team> teams = teamRepository.findByNameContaining(keyword);
        return teams.stream()
                .map(team -> TeamResponseDto.builder()
                        .id(team.getId())
                        .name(team.getName())
                        .introduce(team.getIntroduce())
                        .mainArea(team.getMainArea())
                        .teamLogo(team.getTeamLogo())
                        .leaderName(team.getLeader().getName())
                        .members(team.getMembers().stream().map(TeamMemberResponseDto::new).collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void applyToTeam(Integer teamId, String email) {
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new IllegalArgumentException("사용자를 찾을 수 없습니다.")
        );

        Team team = teamRepository.findById(teamId).orElseThrow(
                () -> new IllegalArgumentException("해당 ID의 팀을 찾을 수 없습니다: " + teamId)
        );

        if (team.getLeader().getId().equals(user.getId())) {
            throw new IllegalArgumentException("자신의 팀에는 지원할 수 없습니다.");
        }

        if (teamApplicationRepository.existsByTeamAndUser(team, user)) {
            throw new IllegalArgumentException("이미 지원한 팀입니다.");
        }

        TeamApplication application = TeamApplication.builder()
                .team(team)
                .user(user)
                .build();

        teamApplicationRepository.save(application);
    }

    @Transactional
    public TeamResponseDto updateTeam(Integer teamId, TeamRequestDto requestDto, String email) {
        Team team = teamRepository.findByIdWithLeader(teamId).orElseThrow(
                () -> new IllegalArgumentException("해당 ID의 팀을 찾을 수 없습니다: " + teamId)
        );

        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new IllegalArgumentException("사용자를 찾을 수 없습니다.")
        );

        if (!Objects.equals(team.getLeader().getId(), user.getId())) {
            throw new IllegalArgumentException("팀 정보 수정 권한이 없습니다.");
        }

        team.update(requestDto);

        return TeamResponseDto.builder()
                .id(team.getId())
                .name(team.getName())
                .introduce(team.getIntroduce())
                .mainArea(team.getMainArea())
                .teamLogo(team.getTeamLogo())
                .leaderName(team.getLeader().getName())
                .members(team.getMembers().stream().map(TeamMemberResponseDto::new).collect(Collectors.toList()))
                .build();
    }

    @Transactional
    public void deleteTeam(Integer teamId, String email) {
        Team team = teamRepository.findById(teamId).orElseThrow(
                () -> new IllegalArgumentException("해당 ID의 팀을 찾을 수 없습니다: " + teamId)
        );

        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new IllegalArgumentException("사용자를 찾을 수 없습니다.")
        );

        if (!Objects.equals(team.getLeader().getId(), user.getId())) {
            throw new IllegalArgumentException("팀 삭제 권한이 없습니다.");
        }

        teamRepository.delete(team);
    }

    @Transactional(readOnly = true)
    public List<TeamApplicationResponseDto> getApplicationsForTeam(Integer teamId, String email) {
        Team team = teamRepository.findById(teamId).orElseThrow(
                () -> new IllegalArgumentException("해당 ID의 팀을 찾을 수 없습니다: " + teamId)
        );

        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new IllegalArgumentException("사용자를 찾을 수 없습니다.")
        );

        if (!Objects.equals(team.getLeader().getId(), user.getId())) {
            throw new IllegalArgumentException("지원자 목록을 조회할 권한이 없습니다.");
        }

        List<TeamApplication> applications = teamApplicationRepository.findAllByTeam(team);

        return applications.stream()
                .map(TeamApplicationResponseDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateApplicationStatus(Integer teamId, Long applicationId, String email, UpdateApplicationStatusRequestDto requestDto) {
        Team team = teamRepository.findById(teamId).orElseThrow(
                () -> new IllegalArgumentException("해당 ID의 팀을 찾을 수 없습니다: " + teamId)
        );

        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new IllegalArgumentException("사용자를 찾을 수 없습니다.")
        );

        if (!Objects.equals(team.getLeader().getId(), user.getId())) {
            throw new IllegalArgumentException("지원 상태를 변경할 권한이 없습니다.");
        }

        TeamApplication application = teamApplicationRepository.findById(applicationId).orElseThrow(
                () -> new IllegalArgumentException("해당 ID의 지원서를 찾을 수 없습니다: " + applicationId)
        );

        if (!application.getTeam().getId().equals(teamId)) {
            throw new IllegalArgumentException("해당 팀의 지원서가 아닙니다.");
        }

        application.updateStatus(requestDto.getStatus());

        if (requestDto.getStatus() == ApplicationStatus.ACCEPTED) {
            User applicant = application.getUser();
            if (!teamMemberRepository.existsByTeamAndUser(team, applicant)) {
                TeamMember newMember = TeamMember.builder()
                        .team(team)
                        .user(applicant)
                        .build();
                teamMemberRepository.save(newMember);
            }
        }
    }

    public boolean isLeader(Integer teamId, String email) {
        return teamRepository.findById(teamId)
                .map(Team::getLeader)
                .map(leader -> leader.getEmail().equals(email))
                .orElse(false);
    }
}
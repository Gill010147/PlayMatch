package com.playmatch.playmatch.dto;

import com.playmatch.playmatch.domain.Team;
import com.playmatch.playmatch.domain.User;
import lombok.Getter;

import java.util.List;

@Getter
public class ProfileResponseDto {
    private final Integer id; // 사용자 ID 필드 추가
    private final String email;
    private final String name;
    private final String area;
    private final String age;
    private final String gender;
    private final List<String> playStyles;
    private final List<String> positions;
    private final List<String> skills;
    private final TeamDto team;

    @Getter
    public static class TeamDto {
        private final Integer id;
        private final String name;
        private final String teamLogo;

        public TeamDto(Team team) {
            this.id = team.getId();
            this.name = team.getName();
            this.teamLogo = team.getTeamLogo();
        }
    }

    public ProfileResponseDto(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.name = user.getName();
        this.area = user.getArea();
        this.age = user.getAge();
        this.gender = user.getGender();
        this.playStyles = user.getPlayStyles();
        this.positions = user.getPositions();
        this.skills = user.getSkills();
        this.team = user.getTeamMemberships().stream()
                .findFirst()
                .map(teamMembership -> new TeamDto(teamMembership.getTeam()))
                .orElse(null);
    }
}

package com.playmatch.playmatch.dto;

import com.playmatch.playmatch.domain.TeamMember;
import com.playmatch.playmatch.domain.User;
import com.playmatch.playmatch.domain.UserRoleEnum;
import lombok.Getter;

import java.util.List;

@Getter
public class UserProfileResponseDto {
    private final Integer id; // 사용자 ID 필드 추가
    private final String email;
    private final String name;
    private final RegionDto region;
    private final String age;
    private final String gender;
    private final String phone;
    private final List<String> playStyles;
    private final List<String> positions;
    private final List<String> skills;
    private final UserRoleEnum role;
    private final TeamInfoDto team; // 팀 정보 필드 추가

    public UserProfileResponseDto(User user) {
        this.id = user.getId(); // ID 필드 초기화
        this.email = user.getEmail();
        this.name = user.getName();
        this.region = new RegionDto(user.getArea());
        this.age = user.getAge();
        this.gender = user.getGender();
        this.phone = user.getPhone();
        this.playStyles = user.getPlayStyles();
        this.positions = user.getPositions();
        this.skills = user.getSkills();
        this.role = user.getRole();

        // 사용자가 리더인 팀을 찾아서 TeamInfoDto 생성
        TeamInfoDto userTeam = null;
        if (user.getTeamMemberships() != null) {
            for (TeamMember tm : user.getTeamMemberships()) {
                if (tm.isLeader()) { // 리더인 팀만 가져옴
                    userTeam = new TeamInfoDto(tm.getTeam());
                    break;
                }
            }
        }
        this.team = userTeam;
    }
}

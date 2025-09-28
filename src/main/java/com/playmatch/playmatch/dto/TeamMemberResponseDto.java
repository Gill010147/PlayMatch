package com.playmatch.playmatch.dto;

import com.playmatch.playmatch.domain.TeamMember;
import lombok.Getter;

@Getter
public class TeamMemberResponseDto {
    private final Integer userId;
    private final String userName;

    public TeamMemberResponseDto(TeamMember teamMember) {
        this.userId = teamMember.getUser().getId();
        this.userName = teamMember.getUser().getName();
    }
}

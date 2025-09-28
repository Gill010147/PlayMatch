package com.playmatch.playmatch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class TeamResponseDto {
    private final Integer id;
    private final String name;
    private final String introduce;
    private final String mainArea;
    private final String teamLogo;
    private final String leaderName;
    private final List<TeamMemberResponseDto> members;
}

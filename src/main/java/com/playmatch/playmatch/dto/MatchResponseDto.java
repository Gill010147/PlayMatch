package com.playmatch.playmatch.dto;

import com.playmatch.playmatch.domain.Match;
import com.playmatch.playmatch.domain.MatchStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class MatchResponseDto {

    private final Long id;
    private final String title;
    private final String hostTeamName;
    private final Integer hostUserId;
    private final LocalDateTime matchDate;
    private final String locationName;
    private final MatchStatus status;
    private final int memberCount;
    private final int maxMemberCount;

    @Builder
    public MatchResponseDto(Match match, int memberCount) {
        this.id = match.getId();
        this.title = match.getTitle();
        this.hostTeamName = match.getHostTeam().getName();
        this.hostUserId = match.getHostTeam().getLeader().getId();
        this.matchDate = match.getMatchDate();
        this.locationName = match.getLocationName();
        this.status = match.getStatus();
        this.memberCount = memberCount;
        this.maxMemberCount = match.getMaxMemberCount();
    }
}
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
    private final MatchStatus status; // 동적으로 계산된 상태
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
        this.memberCount = memberCount;
        this.maxMemberCount = match.getMaxMemberCount();
        this.status = calculateEffectiveStatus(match, memberCount);
    }

    private MatchStatus calculateEffectiveStatus(Match match, int currentMemberCount) {
        // 1. 명시적 상태가 CANCELLED 또는 COMPLETED인 경우 그대로 반환
        if (match.getStatus() == MatchStatus.CANCELLED || match.getStatus() == MatchStatus.COMPLETED) {
            return match.getStatus();
        }

        // 2. 경기 날짜가 지났으면 COMPLETED
        if (match.getMatchDate().isBefore(LocalDateTime.now())) {
            return MatchStatus.COMPLETED;
        }

        // 3. 모집 인원이 가득 찼으면 RECRUITMENT_COMPLETE
        if (currentMemberCount >= match.getMaxMemberCount()) {
            return MatchStatus.RECRUITMENT_COMPLETE;
        }

        // 4. 그 외에는 명시적 상태 (RECRUITING 또는 RECRUITMENT_COMPLETE - 수동 설정)
        return match.getStatus();
    }
}
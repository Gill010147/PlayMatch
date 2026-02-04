package com.playmatch.playmatch.dto;

import com.playmatch.playmatch.domain.ApplicationStatus;
import com.playmatch.playmatch.domain.TeamApplication;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class TeamApplicationResponseDto {
    private final Long applicationId;
    private final ApplicationStatus status;
    private final LocalDateTime appliedAt;
    private final Integer applicantId;
    private final String applicantName;

    public TeamApplicationResponseDto(TeamApplication application) {
        this.applicationId = application.getId();
        this.status = application.getStatus();
        this.appliedAt = application.getCreatedAt();
        this.applicantId = application.getUser().getId();
        this.applicantName = application.getUser().getName();
    }
}

package com.playmatch.playmatch.dto;

import com.playmatch.playmatch.domain.ApplicationStatus;
import com.playmatch.playmatch.domain.MatchApplication;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class MatchApplicationResponseDto {

    private final Long applicationId;
    private final Integer applicantId;
    private final String applicantName;
    private final ApplicationStatus status;
    private final LocalDateTime appliedAt;

    public MatchApplicationResponseDto(MatchApplication application) {
        this.applicationId = application.getId();
        this.applicantId = application.getUser().getId();
        this.applicantName = application.getUser().getName();
        this.status = application.getStatus();
        this.appliedAt = application.getCreatedAt();
    }
}

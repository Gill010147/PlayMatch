package com.playmatch.playmatch.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateReviewRequestDto {

    @NotNull(message = "리뷰 대상 팀 ID는 필수입니다.")
    private Integer reviewedTeamId;

    @NotNull(message = "관련 경기 ID는 필수입니다.")
    private Long matchId;

    @NotNull(message = "평점은 필수입니다.")
    @Min(value = 1, message = "평점은 1 이상이어야 합니다.")
    @Max(value = 5, message = "평점은 5 이하여야 합니다.")
    private Integer rating;

    private String comment;
}

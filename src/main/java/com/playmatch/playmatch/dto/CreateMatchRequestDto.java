package com.playmatch.playmatch.dto;

import com.playmatch.playmatch.domain.MatchType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CreateMatchRequestDto {

    @NotBlank(message = "경기 제목은 필수입니다.")
    private String title;

    @NotNull(message = "호스트 팀 ID는 필수입니다.")
    private Integer hostTeamId;

    @NotNull(message = "경기 날짜는 필수입니다.")
    @Future(message = "경기 날짜는 현재 시간 이후여야 합니다.")
    private LocalDateTime matchDate;

    @NotBlank(message = "장소 이름은 필수입니다.")
    private String locationName;

    @NotNull(message = "위도는 필수입니다.")
    private Double latitude;

    @NotNull(message = "경도는 필수입니다.")
    private Double longitude;

    @NotNull(message = "경기 유형은 필수입니다.")
    private MatchType matchType;

    @NotNull(message = "최대 인원 수는 필수입니다.")
    private Integer maxMemberCount;

    @NotBlank(message = "장소 유형은 필수입니다.")
    private String venueType; // INDOOR or OUTDOOR

    private String description;
}

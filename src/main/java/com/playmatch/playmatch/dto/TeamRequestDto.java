package com.playmatch.playmatch.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

/**
 * 팀 생성 요청을 위한 Data Transfer Object
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamRequestDto {

    @NotBlank(message = "팀 이름은 비워둘 수 없습니다.")
    private String name;

    private String introduce;

    private String mainArea;

    private String teamLogo;
}

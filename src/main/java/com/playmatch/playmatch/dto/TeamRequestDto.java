package com.playmatch.playmatch.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // 추가
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
@JsonIgnoreProperties(ignoreUnknown = true) // 알 수 없는 필드를 무시하도록 추가
public class TeamRequestDto {

    @NotBlank(message = "팀 이름은 비워둘 수 없습니다.")
    private String name;

    private String introduce;

    private String mainArea;

    private String teamLogo;

    private Integer maxMembers;
}

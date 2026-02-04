package com.playmatch.playmatch.dto;

import com.playmatch.playmatch.domain.MatchStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateMatchStatusRequestDto {
    private MatchStatus status;
}

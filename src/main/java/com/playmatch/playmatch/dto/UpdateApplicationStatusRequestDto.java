package com.playmatch.playmatch.dto;

import com.playmatch.playmatch.domain.ApplicationStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateApplicationStatusRequestDto {
    private ApplicationStatus status;
}

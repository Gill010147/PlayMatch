package com.playmatch.playmatch.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class CriteriaDTO {
    private String position;
    private List<String> playStyles;
    private List<String> skills;
}


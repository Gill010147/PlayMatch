package com.playmatch.playmatch.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class
ProfileRequestDto {
    private String name;
    private String area;
    private String age;
    private String gender;
    private List<String> playStyles;
    private List<String> positions;
    private List<String> skills;
}

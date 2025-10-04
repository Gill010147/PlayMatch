package com.playmatch.playmatch.dto;

import com.playmatch.playmatch.domain.User;
import lombok.Getter;

import java.util.List;

@Getter
public class ProfileResponseDto {
    private final String email;
    private final String name;
    private final String area;
    private final String age;
    private final String gender;
    private final List<String> playStyles;
    private final List<String> positions;
    private final List<String> skills;

    public ProfileResponseDto(User user) {
        this.email = user.getEmail();
        this.name = user.getName();
        this.area = user.getArea();
        this.age = user.getAge();
        this.gender = user.getGender();
        this.playStyles = user.getPlayStyles();
        this.positions = user.getPositions();
        this.skills = user.getSkills();
    }
}

package com.playmatch.playmatch.dto;

import com.playmatch.playmatch.domain.User;
import lombok.Getter;

@Getter
public class ProfileResponseDto {
    private final String email;
    private final String name;
    private final String area;
    private final String age;
    private final String gender;
    private final String playStyle;
    private final String position;

    public ProfileResponseDto(User user) {
        this.email = user.getEmail();
        this.name = user.getName();
        this.area = user.getArea();
        this.age = user.getAge();
        this.gender = user.getGender();
        this.playStyle = user.getPlayStyle();
        this.position = user.getPosition();
    }
}

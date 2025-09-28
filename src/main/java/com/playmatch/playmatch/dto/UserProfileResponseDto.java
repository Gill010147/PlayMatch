package com.playmatch.playmatch.dto;

import com.playmatch.playmatch.domain.User;
import com.playmatch.playmatch.domain.UserRoleEnum;
import lombok.Getter;

@Getter
public class UserProfileResponseDto {
    private final String email;
    private final String name;
    private final String area;
    private final String age;
    private final String gender;
    private final String playStyle;
    private final String position;
    private final UserRoleEnum role;

    public UserProfileResponseDto(User user) {
        this.email = user.getEmail();
        this.name = user.getName();
        this.area = user.getArea();
        this.age = user.getAge();
        this.gender = user.getGender();
        this.playStyle = user.getPlayStyle();
        this.position = user.getPosition();
        this.role = user.getRole();
    }
}

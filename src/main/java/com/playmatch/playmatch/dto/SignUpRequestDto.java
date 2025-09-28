package com.playmatch.playmatch.dto;

import com.playmatch.playmatch.domain.UserRoleEnum;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignUpRequestDto {
    private String email;
    private String password;
    private String name;
    private String area;
    private String age;
    private String gender;
    private String playStyle;
    private String position;
    private UserRoleEnum role; // 사용자 역할을 받아옵니다.
}
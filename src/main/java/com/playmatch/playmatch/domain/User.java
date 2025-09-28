package com.playmatch.playmatch.domain;

import com.playmatch.playmatch.dto.ProfileRequestDto;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 30)
    private String name;

    @Column(length = 100)
    private String area;

    @Column(length = 10)
    private String age;

    @Column(length = 10)
    private String gender;

    @Column(name = "play_style", length = 50)
    private String playStyle;

    @Column(length = 30)
    private String position;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRoleEnum role;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TeamMember> teamMemberships = new ArrayList<>();

    @Builder
    public User(String email, String password, String name, String area, String age, String gender, String playStyle, String position, UserRoleEnum role) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.area = area;
        this.age = age;
        this.gender = gender;
        this.playStyle = playStyle;
        this.position = position;
        this.role = role;
    }

    public void updateProfile(ProfileRequestDto requestDto) {
        this.name = requestDto.getName();
        this.area = requestDto.getArea();
        this.age = requestDto.getAge();
        this.gender = requestDto.getGender();
        this.playStyle = requestDto.getPlayStyle();
        this.position = requestDto.getPosition();
    }
}

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

    @Column(length = 20) // 전화번호 필드 추가
    private String phone;

    @Column(length = 10)
    private String age;

    @Column(length = 10)
    private String gender;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "user_play_styles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "play_style", length = 50)
    private List<String> playStyles = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "user_positions", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "position", length = 30)
    private List<String> positions = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "user_skills", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "skill", length = 30)
    private List<String> skills = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRoleEnum role;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TeamMember> teamMemberships = new ArrayList<>();

    @Builder
    public User(String email, String password, String name, String area, String phone, String age, String gender, List<String> playStyles, List<String> positions, List<String> skills, UserRoleEnum role) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.area = area;
        this.phone = phone;
        this.age = age;
        this.gender = gender;
        this.playStyles = playStyles;
        this.positions = positions;
        this.skills = skills;
        this.role = role;
    }

    public void updateProfile(ProfileRequestDto requestDto) {
        this.name = requestDto.getName();
        this.area = requestDto.getArea();
        this.age = requestDto.getAge();
        this.gender = requestDto.getGender();
        this.playStyles = requestDto.getPlayStyles();
        this.positions = requestDto.getPositions();
        this.skills = requestDto.getSkills();
    }
}

package com.playmatch.playmatch.domain;

import com.playmatch.playmatch.dto.TeamRequestDto;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "teams")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor // 모든 필드를 사용하는 생성자 자동 생성
@Builder // 클래스 레벨로 이동하여 모든 필드를 다루는 빌더 생성
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "leader_id", nullable = false)
    private User leader;

    @Builder.Default
    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TeamMember> members = new ArrayList<>();

    @Column(nullable = false, length = 50)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String introduce;

    @Column(name = "main_area", length = 100)
    private String mainArea;

    @Column(name = "team_logo")
    private String teamLogo;

    @Builder.Default
    @Column(name = "max_members")
    private Integer maxMembers = 20; // 기본값 설정

    public void update(TeamRequestDto requestDto) {
        this.name = requestDto.getName();
        this.introduce = requestDto.getIntroduce();
        this.mainArea = requestDto.getMainArea();
        if (requestDto.getMaxMembers() != null) { // 최대 인원 업데이트 추가
            this.maxMembers = requestDto.getMaxMembers();
        }
    }

    //== [추가] 연관관계 편의 메서드 ==//
    public void addTeamMember(TeamMember teamMember) {
        this.members.add(teamMember);
    }
}
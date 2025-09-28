package com.playmatch.playmatch.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "team_members")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 추후 '주장', '부주장', '팀원' 등 역할을 부여할 수 있도록 확장 가능
    // @Enumerated(EnumType.STRING)
    // private TeamRole role;

    @Builder
    public TeamMember(Team team, User user) {
        this.team = team;
        this.user = user;
    }
}

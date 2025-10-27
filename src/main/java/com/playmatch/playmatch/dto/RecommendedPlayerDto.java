package com.playmatch.playmatch.dto;

import com.playmatch.playmatch.domain.User;
import lombok.Getter;

import java.util.List;

@Getter
public class RecommendedPlayerDto {
    private final Integer id;
    private final String name;
    private final String position;
    private final List<String> playStyles;
    private final List<String> skills;
    private final String area;
    private final int score;

    public RecommendedPlayerDto(User user, int score) {
        this.id = user.getId();
        this.name = user.getName();
        // Assuming User entity has a single position. If multiple, logic needs adjustment.
        this.position = user.getPositions() != null && !user.getPositions().isEmpty() ? user.getPositions().get(0) : "미지정";
        this.playStyles = user.getPlayStyles();
        this.skills = user.getSkills();
        this.area = user.getArea();
        this.score = score;
    }
}

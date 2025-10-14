package com.playmatch.playmatch.dto;

import com.playmatch.playmatch.domain.User;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ScoredPlayerDTO {
    private User user; // 기존 User 객체
    private int score;

    public ScoredPlayerDTO(User user, int score) {
        this.user = user;
        this.score = score;
    }
}


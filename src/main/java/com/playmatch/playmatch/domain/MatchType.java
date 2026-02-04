package com.playmatch.playmatch.domain;

import lombok.Getter;

@Getter
public enum MatchType {
    FUTSAL_5V5(5),
    FUTSAL_6V6(6),
    SOCCER_11V11(11);

    private final int playerCount;

    MatchType(int playerCount) {
        this.playerCount = playerCount;
    }
}

package com.playmatch.playmatch.dto;

import com.playmatch.playmatch.domain.Team;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeamInfoDto {
    private Integer id; // Long에서 Integer로 변경
    private String name;
    private String logoUrl;

    public TeamInfoDto(Team team) {
        this.id = team.getId();
        this.name = team.getName();
        if (team.getTeamLogo() != null) {
            String logo = team.getTeamLogo();
            int lastSlash = logo.lastIndexOf('/');
            String filename = lastSlash >= 0 ? logo.substring(lastSlash + 1) : logo;
            this.logoUrl = "/uploads/" + filename;
        } else {
            this.logoUrl = null;
        }
    }
}

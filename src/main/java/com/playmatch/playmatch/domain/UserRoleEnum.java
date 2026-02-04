package com.playmatch.playmatch.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum UserRoleEnum {

    USER("ROLE_USER"),
    ADMIN("ROLE_ADMIN"),
    FACILITY_MANAGER("ROLE_FACILITY_MANAGER");

    private final String authority;

    public String getAuthority() {
        return authority;
    }
}

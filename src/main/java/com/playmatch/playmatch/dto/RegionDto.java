package com.playmatch.playmatch.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegionDto {
    private String city;
    private String district;
    private String neighborhood;
    private String fullAddress;

    public RegionDto(String fullAddress) {
        this.fullAddress = fullAddress;
        // TODO: fullAddress에서 city, district, neighborhood 파싱 로직 추가
        // 현재는 fullAddress만 사용
    }
}

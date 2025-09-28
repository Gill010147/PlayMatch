package com.playmatch.playmatch.dto;

import com.playmatch.playmatch.domain.Facility;
import lombok.Getter;

@Getter
public class FacilityResponseDto {
    private final Long id;
    private final String name;
    private final String address;
    private final String contact;
    private final String operatingHours;
    private final String imageUrl;

    public FacilityResponseDto(Facility facility) {
        this.id = facility.getId();
        this.name = facility.getName();
        this.address = facility.getAddress();
        this.contact = facility.getContact();
        this.operatingHours = facility.getOperatingHours();
        this.imageUrl = facility.getImageUrl();
    }
}

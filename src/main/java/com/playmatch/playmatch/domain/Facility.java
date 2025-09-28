package com.playmatch.playmatch.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "facilities")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Facility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column
    private String address;

    @Column
    private String contact;

    @Column(name = "operating_hours")
    private String operatingHours;

    @Column(name = "image_url")
    private String imageUrl;

    @Builder
    public Facility(String name, String address, String contact, String operatingHours, String imageUrl) {
        this.name = name;
        this.address = address;
        this.contact = contact;
        this.operatingHours = operatingHours;
        this.imageUrl = imageUrl;
    }
}

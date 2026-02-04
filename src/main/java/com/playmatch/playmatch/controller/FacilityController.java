package com.playmatch.playmatch.controller;

import com.playmatch.playmatch.dto.FacilityResponseDto;
import com.playmatch.playmatch.service.FacilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/facilities")
@RequiredArgsConstructor
public class FacilityController {

    private final FacilityService facilityService;

    @GetMapping("/{facilityId}")
    public ResponseEntity<FacilityResponseDto> getFacility(@PathVariable Long facilityId) {
        FacilityResponseDto facility = facilityService.getFacility(facilityId);
        return ResponseEntity.ok(facility);
    }
}
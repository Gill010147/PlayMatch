package com.playmatch.playmatch.service;

import com.playmatch.playmatch.dto.FacilityResponseDto;
import com.playmatch.playmatch.repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FacilityService {

    private final FacilityRepository facilityRepository;

    @Transactional(readOnly = true)
    public FacilityResponseDto getFacility(Long facilityId) {
        return facilityRepository.findById(facilityId)
                .map(FacilityResponseDto::new)
                .orElseThrow(() -> new IllegalArgumentException("해당 구장을 찾을 수 없습니다."));
    }
}
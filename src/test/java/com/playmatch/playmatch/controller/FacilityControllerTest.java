package com.playmatch.playmatch.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.playmatch.playmatch.domain.Facility;
import com.playmatch.playmatch.repository.FacilityRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class FacilityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private FacilityRepository facilityRepository;

    private Facility testFacility;

    @BeforeEach
    void setUp() {
        facilityRepository.deleteAll();
        testFacility = Facility.builder()
                .name("플레이매치 구장")
                .address("서울시 강남구")
                .contact("02-1234-5678")
                .operatingHours("09:00 - 22:00")
                .imageUrl("http://example.com/image.jpg")
                .build();
        facilityRepository.save(testFacility);
    }

    @Test
    @DisplayName("구장 프로필 조회 성공")
    void getFacility_Success() throws Exception {
        // when & then
        mockMvc.perform(get("/api/facilities/" + testFacility.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("플레이매치 구장"))
                .andExpect(jsonPath("$.address").value("서울시 강남구"));
    }
}

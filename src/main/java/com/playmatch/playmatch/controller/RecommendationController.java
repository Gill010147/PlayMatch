package com.playmatch.playmatch.controller;

import com.playmatch.playmatch.dto.Point;
import com.playmatch.playmatch.dto.RecommendationRequestDto;
import com.playmatch.playmatch.dto.RecommendedPlayerDto;
import com.playmatch.playmatch.service.KakaoApiService;
import com.playmatch.playmatch.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final KakaoApiService kakaoApiService; // KakaoApiService 주입

    @PostMapping("/players")
    public ResponseEntity<List<RecommendedPlayerDto>> recommendPlayers(@RequestBody RecommendationRequestDto requestDto) {
        Point coordinates = null;
        // 주소가 있는 경우, 좌표로 변환
        if (requestDto.getArea() != null && !requestDto.getArea().isBlank()) {
            coordinates = kakaoApiService.getCoordinates(requestDto.getArea());
        }

        List<RecommendedPlayerDto> recommendations = recommendationService.recommendPlayers(requestDto, coordinates);
        return ResponseEntity.ok(recommendations);
    }
}

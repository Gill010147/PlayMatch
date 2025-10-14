package com.playmatch.playmatch.controller;

import com.playmatch.playmatch.dto.CriteriaDTO;
import com.playmatch.playmatch.dto.ScoredPlayerDTO;
import com.playmatch.playmatch.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.playmatch.playmatch.security.UserDetailsImpl;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    @Autowired
    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @PostMapping("/players")
    public ResponseEntity<List<ScoredPlayerDTO>> recommendPlayers(
            @RequestBody CriteriaDTO criteria,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        // 로그인한 사용자의 ID를 가져와 서비스에 전달합니다.
        Long currentUserId = userDetails.getUser().getId().longValue(); // Integer -> Long으로 변환
        List<ScoredPlayerDTO> recommendedPlayers = recommendationService.getRecommendedPlayers(criteria, currentUserId);
        return ResponseEntity.ok(recommendedPlayers);
    }
}


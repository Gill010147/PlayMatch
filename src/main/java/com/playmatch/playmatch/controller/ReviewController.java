package com.playmatch.playmatch.controller;

import com.playmatch.playmatch.dto.CreateReviewRequestDto;
import com.playmatch.playmatch.dto.ReviewResponseDto;
import com.playmatch.playmatch.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<String> createReview(@Valid @RequestBody CreateReviewRequestDto requestDto, Principal principal) {
        reviewService.createReview(requestDto, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body("리뷰가 성공적으로 등록되었습니다.");
    }

    @GetMapping("/teams/{teamId}")
    public ResponseEntity<List<ReviewResponseDto>> getReviewsForTeam(@PathVariable Integer teamId) {
        List<ReviewResponseDto> reviews = reviewService.getReviewsForTeam(teamId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<List<ReviewResponseDto>> getReviewsForUser(@PathVariable Integer userId) {
        List<ReviewResponseDto> reviews = reviewService.getReviewsForUser(userId);
        return ResponseEntity.ok(reviews);
    }
}

package com.playmatch.playmatch.dto;

import com.playmatch.playmatch.domain.Review;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ReviewResponseDto {

    private final Long id;
    private final Integer rating;
    private final String comment;
    private final String reviewerName;
    private final LocalDateTime createdAt;

    public ReviewResponseDto(Review review) {
        this.id = review.getId();
        this.rating = review.getRating();
        this.comment = review.getComment();
        this.reviewerName = review.getReviewer().getName(); // Get name from the User entity
        this.createdAt = review.getCreatedAt();
    }
}

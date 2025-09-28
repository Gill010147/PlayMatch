package com.playmatch.playmatch.repository;

import com.playmatch.playmatch.domain.Match;
import com.playmatch.playmatch.domain.Review;
import com.playmatch.playmatch.domain.User;
import com.playmatch.playmatch.domain.Team;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByMatchAndReviewer(Match match, User reviewer);
    List<Review> findAllByReviewedTeam(Team team);
}

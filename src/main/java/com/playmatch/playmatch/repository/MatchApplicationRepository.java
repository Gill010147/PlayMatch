package com.playmatch.playmatch.repository;

import com.playmatch.playmatch.domain.ApplicationStatus;
import com.playmatch.playmatch.domain.Match;
import com.playmatch.playmatch.domain.MatchApplication;
import com.playmatch.playmatch.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MatchApplicationRepository extends JpaRepository<MatchApplication, Long> {
    boolean existsByMatchAndUser(Match match, User user);

    List<MatchApplication> findAllByMatch(Match match);

    long countByMatchAndStatus(Match match, ApplicationStatus status);

    boolean existsByMatchAndUserAndStatus(Match match, User user, ApplicationStatus status);
}
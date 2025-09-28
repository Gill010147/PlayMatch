package com.playmatch.playmatch.repository;

import com.playmatch.playmatch.domain.Match;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MatchRepository extends JpaRepository<Match, Long> {
    List<Match> findByTitle(String title);
}
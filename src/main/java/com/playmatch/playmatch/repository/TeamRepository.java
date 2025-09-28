package com.playmatch.playmatch.repository;

import com.playmatch.playmatch.domain.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TeamRepository extends JpaRepository<Team, Integer> {
    List<Team> findByNameContaining(String keyword);

    @Query("SELECT t FROM Team t JOIN FETCH t.leader WHERE t.id = :teamId")
    Optional<Team> findByIdWithLeader(@Param("teamId") Integer teamId);
}
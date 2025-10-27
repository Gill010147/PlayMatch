package com.playmatch.playmatch.repository;

import com.playmatch.playmatch.domain.VideoFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface VideoFeedbackRepository extends JpaRepository<VideoFeedback, Long> {
    @Query("SELECT vf FROM VideoFeedback vf " +
           "LEFT JOIN FETCH vf.comments vc " +
           "LEFT JOIN FETCH vc.author " +
           "WHERE vf.id = :id")
    Optional<VideoFeedback> findByIdWithCommentsAndAuthors(@Param("id") Long id);
}

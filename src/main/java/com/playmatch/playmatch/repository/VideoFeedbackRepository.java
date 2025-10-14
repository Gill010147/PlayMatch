package com.playmatch.playmatch.repository;

import com.playmatch.playmatch.domain.VideoFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VideoFeedbackRepository extends JpaRepository<VideoFeedback, Long> {
}


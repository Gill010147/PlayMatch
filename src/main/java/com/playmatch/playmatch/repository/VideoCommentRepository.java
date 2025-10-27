package com.playmatch.playmatch.repository;

import com.playmatch.playmatch.domain.VideoComment;
import com.playmatch.playmatch.domain.VideoFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VideoCommentRepository extends JpaRepository<VideoComment, Long> {
    List<VideoComment> findAllByVideoFeedbackOrderByCreatedAtAsc(VideoFeedback videoFeedback);
}

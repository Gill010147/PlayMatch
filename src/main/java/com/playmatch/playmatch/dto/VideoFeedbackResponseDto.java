package com.playmatch.playmatch.dto;

import com.playmatch.playmatch.domain.VideoFeedback;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class VideoFeedbackResponseDto {
    private final Long id;
    private final String title;
    private final String description;
    private final String videoUrl;
    private final String uploaderName;
    private final Integer uploaderId; // 추가
    private final LocalDateTime uploadDate;
    private final List<VideoCommentResponseDto> comments;

    public VideoFeedbackResponseDto(VideoFeedback videoFeedback, String baseUrl) {
        this.id = videoFeedback.getId();
        this.title = videoFeedback.getTitle();
        this.description = videoFeedback.getDescription();
        this.videoUrl = baseUrl + videoFeedback.getVideoUrl();
        this.uploaderName = videoFeedback.getUploader().getName();
        this.uploaderId = videoFeedback.getUploader().getId(); // 추가
        this.uploadDate = videoFeedback.getUploadDate();
        this.comments = videoFeedback.getComments().stream()
                .map(VideoCommentResponseDto::new)
                .collect(Collectors.toList());
    }
}

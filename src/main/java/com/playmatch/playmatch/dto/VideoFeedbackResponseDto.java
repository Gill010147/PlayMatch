package com.playmatch.playmatch.dto;

import com.playmatch.playmatch.domain.VideoFeedback;
import lombok.Getter;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class VideoFeedbackResponseDto {
    private Long id;
    private String title;
    private String description;
    private String videoUrl;
    private LocalDateTime uploadDate;
    private List<String> comments;
    private UserProfileResponseDto uploader;
    private int commentsCount; // Added for list view

    public VideoFeedbackResponseDto(VideoFeedback videoFeedback) {
        this.id = videoFeedback.getId();
        this.title = videoFeedback.getTitle();
        this.description = videoFeedback.getDescription();
        this.videoUrl = videoFeedback.getVideoUrl();
        this.uploadDate = videoFeedback.getUploadDate();
        this.comments = videoFeedback.getComments();
        this.uploader = new UserProfileResponseDto(videoFeedback.getUploader());
        this.commentsCount = videoFeedback.getComments() != null ? videoFeedback.getComments().size() : 0;
    }

    public static List<VideoFeedbackResponseDto> listOf(List<VideoFeedback> videoFeedbacks) {
        return videoFeedbacks.stream()
                .map(VideoFeedbackResponseDto::new)
                .collect(Collectors.toList());
    }
}


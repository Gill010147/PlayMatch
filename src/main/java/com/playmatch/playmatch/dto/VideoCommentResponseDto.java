package com.playmatch.playmatch.dto;

import com.playmatch.playmatch.domain.VideoComment;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class VideoCommentResponseDto {
    private final Long id;
    private final String authorName;
    private final Integer authorId; // 추가
    private final String text;
    private final LocalDateTime createdAt;

    public VideoCommentResponseDto(VideoComment videoComment) {
        this.id = videoComment.getId();
        this.authorName = videoComment.getAuthor().getName();
        this.authorId = videoComment.getAuthor().getId(); // 추가
        this.text = videoComment.getText();
        this.createdAt = videoComment.getCreatedAt();
    }
}

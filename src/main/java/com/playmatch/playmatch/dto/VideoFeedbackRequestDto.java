package com.playmatch.playmatch.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class VideoFeedbackRequestDto {
    private String title;
    private String description;
    private MultipartFile videoFile;
}

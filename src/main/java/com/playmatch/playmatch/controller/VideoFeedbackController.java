package com.playmatch.playmatch.controller;

import com.playmatch.playmatch.service.VideoFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/video-feedback")
@RequiredArgsConstructor
public class VideoFeedbackController {

    private final VideoFeedbackService videoFeedbackService;

    @PostMapping("/upload")
    public void uploadVideoFeedback(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam MultipartFile videoFile,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Integer → Long 변환
        videoFeedbackService.uploadVideoFeedback(
                title,
                description,
                videoFile,
                userDetails.getUser().getId().longValue()
        );
    }
}


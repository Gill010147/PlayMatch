package com.playmatch.playmatch.controller;

import com.playmatch.playmatch.domain.VideoFeedback;
import com.playmatch.playmatch.service.VideoFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/video-feedbacks")
@RequiredArgsConstructor
public class VideoFeedbackController {

    private final VideoFeedbackService videoFeedbackService;

    @GetMapping
    public ResponseEntity<List<VideoFeedback>> getAllVideoFeedbacks() {
        List<VideoFeedback> videoFeedbacks = videoFeedbackService.getAllVideoFeedbacks();
        return ResponseEntity.ok(videoFeedbacks);
    }

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
                ((com.playmatch.playmatch.security.UserDetailsImpl) userDetails).getUser().getId().longValue()
        );
    }
}


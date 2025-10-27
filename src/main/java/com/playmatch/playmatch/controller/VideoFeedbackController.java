package com.playmatch.playmatch.controller;

import com.playmatch.playmatch.dto.VideoCommentRequestDto;
import com.playmatch.playmatch.dto.VideoCommentResponseDto;
import com.playmatch.playmatch.dto.VideoFeedbackRequestDto;
import com.playmatch.playmatch.dto.VideoFeedbackResponseDto;
import com.playmatch.playmatch.service.VideoFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/video-feedbacks")
@RequiredArgsConstructor
public class

VideoFeedbackController {

    private final VideoFeedbackService videoFeedbackService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<VideoFeedbackResponseDto> uploadVideoFeedback(
            @RequestPart("videoFile") MultipartFile videoFile,
            @RequestPart("title") String title,
            @RequestPart("description") String description,
            Principal principal) throws IOException {

        VideoFeedbackRequestDto requestDto = new VideoFeedbackRequestDto();
        requestDto.setVideoFile(videoFile);
        requestDto.setTitle(title);
        requestDto.setDescription(description);

        VideoFeedbackResponseDto responseDto = videoFeedbackService.uploadVideoFeedback(requestDto, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }

    @GetMapping
    public ResponseEntity<List<VideoFeedbackResponseDto>> getAllVideoFeedbacks() {
        List<VideoFeedbackResponseDto> videoFeedbacks = videoFeedbackService.getAllVideoFeedbacks();
        return ResponseEntity.ok(videoFeedbacks);
    }

    @GetMapping("/{videoId}")
    public ResponseEntity<VideoFeedbackResponseDto> getVideoFeedbackById(@PathVariable Long videoId) {
        VideoFeedbackResponseDto videoFeedback = videoFeedbackService.getVideoFeedbackById(videoId);
        return ResponseEntity.ok(videoFeedback);
    }

    @PostMapping("/{videoId}/comments")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<VideoCommentResponseDto> addCommentToVideoFeedback(
            @PathVariable Long videoId,
            @RequestBody VideoCommentRequestDto requestDto,
            Principal principal) {
        VideoCommentResponseDto comment = videoFeedbackService.addCommentToVideoFeedback(videoId, requestDto, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    @DeleteMapping("/{videoId}")
    @PreAuthorize("hasPermission(#videoId, 'VideoFeedback', 'delete')")
    public ResponseEntity<Void> deleteVideoFeedback(@PathVariable Long videoId, Principal principal) throws IOException {
        videoFeedbackService.deleteVideoFeedback(videoId, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{videoId}/comments/{commentId}")
    @PreAuthorize("hasPermission(#commentId, 'VideoComment', 'delete')")
    public ResponseEntity<Void> deleteComment(@PathVariable Long videoId, @PathVariable Long commentId, Principal principal) {
        videoFeedbackService.deleteComment(videoId, commentId, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{videoId}")
    @PreAuthorize("hasPermission(#videoId, 'VideoFeedback', 'edit')")
    public ResponseEntity<VideoFeedbackResponseDto> updateVideoFeedback(
            @PathVariable Long videoId,
            @RequestBody VideoFeedbackRequestDto requestDto,
            Principal principal) {
        VideoFeedbackResponseDto updatedFeedback = videoFeedbackService.updateVideoFeedback(videoId, requestDto, principal.getName());
        return ResponseEntity.ok(updatedFeedback);
    }

    @PutMapping("/{videoId}/comments/{commentId}")
    @PreAuthorize("hasPermission(#commentId, 'VideoComment', 'edit')")
    public ResponseEntity<VideoCommentResponseDto> updateComment(
            @PathVariable Long videoId,
            @PathVariable Long commentId,
            @RequestBody VideoCommentRequestDto requestDto,
            Principal principal) {
        VideoCommentResponseDto updatedComment = videoFeedbackService.updateComment(videoId, commentId, requestDto, principal.getName());
        return ResponseEntity.ok(updatedComment);
    }
}
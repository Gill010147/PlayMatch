package com.playmatch.playmatch.service;

import com.playmatch.playmatch.domain.User;
import com.playmatch.playmatch.domain.VideoComment;
import com.playmatch.playmatch.domain.VideoFeedback;
import com.playmatch.playmatch.dto.VideoCommentRequestDto;
import com.playmatch.playmatch.dto.VideoCommentResponseDto;
import com.playmatch.playmatch.dto.VideoFeedbackRequestDto;
import com.playmatch.playmatch.dto.VideoFeedbackResponseDto;
import com.playmatch.playmatch.repository.UserRepository;
import com.playmatch.playmatch.repository.VideoCommentRepository;
import com.playmatch.playmatch.repository.VideoFeedbackRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // 추가
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j // 추가
@Service
@RequiredArgsConstructor
public class VideoFeedbackService {

    private final VideoFeedbackRepository videoFeedbackRepository;
    private final VideoCommentRepository videoCommentRepository;
    private final UserRepository userRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${app.base-url:http://localhost:8080}") // application.yml에서 설정, 없으면 기본값
    private String baseUrl;

    @Transactional
    public VideoFeedbackResponseDto uploadVideoFeedback(VideoFeedbackRequestDto requestDto, String uploaderEmail) throws IOException {
        User uploader = userRepository.findByEmail(uploaderEmail)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        MultipartFile videoFile = requestDto.getVideoFile();
        String videoUrl = storeFile(videoFile);

        VideoFeedback videoFeedback = VideoFeedback.builder()
                .uploader(uploader)
                .title(requestDto.getTitle())
                .description(requestDto.getDescription())
                .videoUrl(videoUrl)
                .build();

        VideoFeedback savedFeedback = videoFeedbackRepository.save(videoFeedback);
        return new VideoFeedbackResponseDto(savedFeedback, baseUrl);
    }

    @Transactional(readOnly = true)
    public List<VideoFeedbackResponseDto> getAllVideoFeedbacks() {
        return videoFeedbackRepository.findAll().stream()
                .map(videoFeedback -> new VideoFeedbackResponseDto(videoFeedback, baseUrl))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VideoFeedbackResponseDto getVideoFeedbackById(Long videoId) {
        VideoFeedback videoFeedback = videoFeedbackRepository.findByIdWithCommentsAndAuthors(videoId)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 영상 피드백을 찾을 수 없습니다."));
        return new VideoFeedbackResponseDto(videoFeedback, baseUrl);
    }

    @Transactional
    public VideoCommentResponseDto addCommentToVideoFeedback(Long videoId, VideoCommentRequestDto requestDto, String authorEmail) {
        User author = userRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        VideoFeedback videoFeedback = videoFeedbackRepository.findById(videoId)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 영상 피드백을 찾을 수 없습니다."));

        VideoComment comment = VideoComment.builder()
                .videoFeedback(videoFeedback)
                .author(author)
                .text(requestDto.getText())
                .build();

        VideoComment savedComment = videoCommentRepository.save(comment);
        return new VideoCommentResponseDto(savedComment);
    }

    @Transactional
    public void deleteVideoFeedback(Long videoId, String email) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        VideoFeedback videoFeedback = videoFeedbackRepository.findById(videoId)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 영상 피드백을 찾을 수 없습니다."));

        if (!videoFeedback.getUploader().getId().equals(user.getId())) {
            throw new IllegalArgumentException("영상 피드백을 삭제할 권한이 없습니다.");
        }

        // 파일 시스템에서 영상 파일 삭제
        deleteFile(videoFeedback.getVideoUrl());

        videoFeedbackRepository.delete(videoFeedback);
    }

    @Transactional(readOnly = true)
    public boolean isUploader(Long videoId, String email) {
        return videoFeedbackRepository.findById(videoId)
                .map(videoFeedback -> videoFeedback.getUploader().getEmail().equals(email))
                .orElse(false);
    }

    @Transactional
    public void deleteComment(Long videoId, Long commentId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        VideoComment comment = videoCommentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 댓글을 찾을 수 없습니다."));

        if (!comment.getVideoFeedback().getId().equals(videoId)) {
            throw new IllegalArgumentException("해당 영상의 댓글이 아닙니다.");
        }

        if (!comment.getAuthor().getId().equals(user.getId())) {
            throw new IllegalArgumentException("댓글을 삭제할 권한이 없습니다.");
        }

        videoCommentRepository.delete(comment);
    }

    @Transactional(readOnly = true)
    public boolean isCommentAuthor(Long commentId, String email) {
        return videoCommentRepository.findById(commentId)
                .map(comment -> comment.getAuthor().getEmail().equals(email))
                .orElse(false);
    }

    @Transactional
    public VideoFeedbackResponseDto updateVideoFeedback(Long videoId, VideoFeedbackRequestDto requestDto, String updaterEmail) {
        VideoFeedback videoFeedback = videoFeedbackRepository.findById(videoId)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 영상 피드백을 찾을 수 없습니다."));

        // 권한 검사는 @PreAuthorize에서 이미 처리되지만, 서비스 계층에서도 한 번 더 확인하는 것이 좋습니다.
        User updater = userRepository.findByEmail(updaterEmail)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!videoFeedback.getUploader().getId().equals(updater.getId())) {
            throw new IllegalArgumentException("영상 피드백을 수정할 권한이 없습니다.");
        }

        videoFeedback.update(requestDto.getTitle(), requestDto.getDescription());
        VideoFeedback updatedFeedback = videoFeedbackRepository.save(videoFeedback);
        return new VideoFeedbackResponseDto(updatedFeedback, baseUrl);
    }

    @Transactional
    public VideoCommentResponseDto updateComment(Long videoId, Long commentId, VideoCommentRequestDto requestDto, String updaterEmail) {
        VideoComment comment = videoCommentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 댓글을 찾을 수 없습니다."));

        User updater = userRepository.findByEmail(updaterEmail)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!comment.getVideoFeedback().getId().equals(videoId)) {
            throw new IllegalArgumentException("해당 영상의 댓글이 아닙니다.");
        }

        if (!comment.getAuthor().getId().equals(updater.getId())) {
            throw new IllegalArgumentException("댓글을 수정할 권한이 없습니다.");
        }

        comment.update(requestDto.getText());
        VideoComment updatedComment = videoCommentRepository.save(comment);
        return new VideoCommentResponseDto(updatedComment);
    }

    private String storeFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("Failed to store empty file.");
        }
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath); // 디렉토리가 없으면 생성
        log.info("Resolved upload path: {}", uploadPath.toString());
        Path filePath = uploadPath.resolve(uniqueFileName);
        log.info("Attempting to save file to: {}", filePath.toString());
        try {
            Files.copy(file.getInputStream(), filePath);
            log.info("File saved successfully to: {}", filePath.toString());
        } catch (IOException e) {
            log.error("Failed to save file to {}: {}", filePath.toString(), e.getMessage());
            throw e; // 예외를 다시 던져서 상위 계층에서 처리할 수 있도록 함
        }
        return "/uploads/" + uniqueFileName; // 클라이언트에서 접근 가능한 URL 반환
    }

    private void deleteFile(String fileUrl) throws IOException {
        // URL에서 파일 이름 추출 (예: /uploads/uuid.mp4 -> uuid.mp4)
        String fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
        Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(fileName);
        Files.deleteIfExists(filePath);
    }
}

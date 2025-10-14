package com.playmatch.playmatch.service;

import com.playmatch.playmatch.domain.User;
import com.playmatch.playmatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VideoFeedbackService {

    private final UserRepository userRepository;

    public void uploadVideoFeedback(String title, String description, MultipartFile videoFile, Long userId) {
        // User 가져오기
        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isEmpty()) {
            throw new IllegalArgumentException("존재하지 않는 사용자입니다.");
        }
        User uploader = optionalUser.get();

        // 비디오 업로드 및 DB 저장 로직 구현 (필요시)
        // ...
    }
}


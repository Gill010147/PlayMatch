package com.playmatch.playmatch.service;

import com.playmatch.playmatch.domain.User;
import com.playmatch.playmatch.dto.ProfileRequestDto;
import com.playmatch.playmatch.dto.ProfileResponseDto;
import com.playmatch.playmatch.dto.UserProfileResponseDto; // 추가
import com.playmatch.playmatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final UserService userService; // UserService 주입

    @Transactional(readOnly = true)
    public UserProfileResponseDto getMyProfile(String email) {
        System.out.println("ProfileService.getMyProfile called for user: " + email); // 디버깅용
        // UserService의 getUserProfile 메서드를 호출하여 프로필 정보를 가져옴
        return userService.getUserProfile(email);
    }

    @Transactional
    public void updateMyProfile(String email, ProfileRequestDto requestDto) {
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new IllegalArgumentException("사용자를 찾을 수 없습니다.")
        );
        user.updateProfile(requestDto);
    }

    @Transactional(readOnly = true)
    public ProfileResponseDto getUserProfile(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(
                () -> new IllegalArgumentException("사용자를 찾을 수 없습니다.")
        );
        return new ProfileResponseDto(user);
    }
}
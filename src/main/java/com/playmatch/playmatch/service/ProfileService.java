package com.playmatch.playmatch.service;

import com.playmatch.playmatch.domain.User;
import com.playmatch.playmatch.dto.ProfileRequestDto;
import com.playmatch.playmatch.dto.ProfileResponseDto;
import com.playmatch.playmatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public ProfileResponseDto getMyProfile(String email) {
        User user = userRepository.findByEmailWithTeamMemberships(email).orElseThrow(
                () -> new IllegalArgumentException("사용자를 찾을 수 없습니다.")
        );
        return new ProfileResponseDto(user);
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
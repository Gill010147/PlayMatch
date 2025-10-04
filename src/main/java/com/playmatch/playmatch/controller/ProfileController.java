package com.playmatch.playmatch.controller;

import com.playmatch.playmatch.dto.ProfileRequestDto;
import com.playmatch.playmatch.dto.ProfileResponseDto;
import com.playmatch.playmatch.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ProfileResponseDto> getMyProfile(Principal principal) {
        ProfileResponseDto profile = profileService.getMyProfile(principal.getName());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> updateMyProfile(Principal principal, @RequestBody ProfileRequestDto requestDto) {
        profileService.updateMyProfile(principal.getName(), requestDto);
        return ResponseEntity.ok("프로필이 성공적으로 수정되었습니다.");
    }

    @GetMapping("/users/{userId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ProfileResponseDto> getUserProfile(@PathVariable Integer userId) {
        ProfileResponseDto profile = profileService.getUserProfile(userId);
        return ResponseEntity.ok(profile);
    }
}

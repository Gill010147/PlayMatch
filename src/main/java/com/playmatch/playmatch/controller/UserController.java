package com.playmatch.playmatch.controller;

import com.playmatch.playmatch.dto.ProfileResponseDto;
import com.playmatch.playmatch.dto.UserProfileResponseDto; // 추가
import com.playmatch.playmatch.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final ProfileService profileService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserProfileResponseDto> getMyProfile(Principal principal) {
        System.out.println("UserController.getMyProfile called for user: " + principal.getName()); // 디버깅용
        UserProfileResponseDto profile = profileService.getMyProfile(principal.getName());
        return ResponseEntity.ok(profile);
    }
}
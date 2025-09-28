package com.playmatch.playmatch.controller;

import com.playmatch.playmatch.dto.ProfileResponseDto;
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
    public ResponseEntity<ProfileResponseDto> getMyProfile(Principal principal) {
        ProfileResponseDto profile = profileService.getMyProfile(principal.getName());
        return ResponseEntity.ok(profile);
    }
}
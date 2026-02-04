package com.playmatch.playmatch.controller;

import com.playmatch.playmatch.dto.CreateMatchRequestDto;
import com.playmatch.playmatch.dto.MatchApplicationResponseDto;
import com.playmatch.playmatch.dto.MatchResponseDto;
import com.playmatch.playmatch.dto.UpdateApplicationStatusRequestDto;
import com.playmatch.playmatch.dto.UpdateMatchStatusRequestDto;
import com.playmatch.playmatch.service.MatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam; // 추가
import org.springframework.format.annotation.DateTimeFormat; // 추가

import java.security.Principal;
import java.time.LocalDate; // 추가
import java.util.List;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> createMatch(@Valid @RequestBody CreateMatchRequestDto requestDto,
                                              Principal principal) {
        matchService.createMatch(requestDto, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body("경기 생성이 완료되었습니다.");
    }

    @GetMapping
    public ResponseEntity<List<MatchResponseDto>> getMatches(
            @RequestParam(required = false) String region,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String title) {
        List<MatchResponseDto> matches = matchService.getMatches(region, date, title);
        return ResponseEntity.ok(matches);
    }

    @GetMapping("/{matchId}")
    public ResponseEntity<MatchResponseDto> getMatchDetails(@PathVariable Long matchId) {
        MatchResponseDto match = matchService.getMatchDetails(matchId);
        return ResponseEntity.ok(match);
    }

    @PostMapping("/{matchId}/participants")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> applyToMatch(@PathVariable Long matchId,
                                               Principal principal) {
        matchService.applyToMatch(matchId, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body("경기에 성공적으로 지원했습니다.");
    }

    @GetMapping("/{matchId}/participants")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<MatchApplicationResponseDto>> getApplicationsForMatch(@PathVariable Long matchId,
                                                                                     Principal principal) {
        List<MatchApplicationResponseDto> applications = matchService.getApplicationsForMatch(matchId, principal.getName());
        return ResponseEntity.ok(applications);
    }

    @PutMapping("/{matchId}/applications/{applicationId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> updateMatchApplicationStatus(@PathVariable Long matchId,
                                                               @PathVariable Long applicationId,
                                                               Principal principal,
                                                               @RequestBody UpdateApplicationStatusRequestDto requestDto) {
        matchService.updateMatchApplicationStatus(matchId, applicationId, principal.getName(), requestDto);
        return ResponseEntity.ok("경기 지원 상태가 변경되었습니다.");
    }

    @PutMapping("/{matchId}/status")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> updateMatchStatus(@PathVariable Long matchId,
                                                    Principal principal,
                                                    @RequestBody UpdateMatchStatusRequestDto requestDto) {
        matchService.updateMatchStatus(matchId, principal.getName(), requestDto);
        return ResponseEntity.ok("경기 상태가 변경되었습니다.");
    }
}
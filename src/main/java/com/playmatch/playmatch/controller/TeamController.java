package com.playmatch.playmatch.controller;

import com.playmatch.playmatch.dto.TeamApplicationResponseDto;
import com.playmatch.playmatch.dto.TeamRequestDto;
import com.playmatch.playmatch.dto.TeamResponseDto;
import com.playmatch.playmatch.dto.UpdateApplicationStatusRequestDto;
import com.playmatch.playmatch.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PostMapping(consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> createTeam(@Valid @RequestPart("requestDto") TeamRequestDto requestDto,
                                             @RequestPart(value = "logo", required = false) MultipartFile logo,
                                             Principal principal) {
        teamService.createTeam(requestDto, logo, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body("팀 생성 완료");
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<TeamResponseDto>> getMyTeams(Principal principal) {
        List<TeamResponseDto> myTeams = teamService.getMyTeams(principal.getName());
        return ResponseEntity.ok(myTeams);
    }

    @GetMapping("/{teamId}")
    public ResponseEntity<TeamResponseDto> getTeam(@PathVariable Integer teamId) {
        TeamResponseDto team = teamService.getTeam(teamId);
        return ResponseEntity.ok(team);
    }

    @GetMapping("/search")
    public ResponseEntity<List<TeamResponseDto>> searchTeams(@RequestParam String keyword) {
        List<TeamResponseDto> teams = teamService.searchTeams(keyword);
        return ResponseEntity.ok(teams);
    }

    @PostMapping("/{teamId}/apply")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> applyToTeam(@PathVariable Integer teamId, Principal principal) {
        teamService.applyToTeam(teamId, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body("팀 지원이 완료되었습니다.");
    }

    @PutMapping("/{teamId}")
    @PreAuthorize("@teamService.isLeader(#teamId, authentication.name)")
    public ResponseEntity<TeamResponseDto> updateTeam(@PathVariable Integer teamId, @Valid @RequestBody TeamRequestDto requestDto, Principal principal) {
        TeamResponseDto updatedTeam = teamService.updateTeam(teamId, requestDto, principal.getName());
        return ResponseEntity.ok(updatedTeam);
    }

    @DeleteMapping("/{teamId}")
    @PreAuthorize("@teamService.isLeader(#teamId, authentication.name)")
    public ResponseEntity<String> deleteTeam(@PathVariable Integer teamId, Principal principal) {
        teamService.deleteTeam(teamId, principal.getName());
        return ResponseEntity.ok("팀 삭제 완료");
    }

    @GetMapping("/{teamId}/applications")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<TeamApplicationResponseDto>> getApplicationsForTeam(@PathVariable Integer teamId, Principal principal) {
        List<TeamApplicationResponseDto> applications = teamService.getApplicationsForTeam(teamId, principal.getName());
        return ResponseEntity.ok(applications);
    }

    @PutMapping("/{teamId}/applications/{applicationId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> updateApplicationStatus(@PathVariable Integer teamId, @PathVariable Long applicationId, Principal principal, @RequestBody UpdateApplicationStatusRequestDto requestDto) {
        teamService.updateApplicationStatus(teamId, applicationId, principal.getName(), requestDto);
        return ResponseEntity.ok("지원 상태가 변경되었습니다.");
    }
}
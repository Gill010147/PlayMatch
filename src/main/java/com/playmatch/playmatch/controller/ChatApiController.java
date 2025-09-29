package com.playmatch.playmatch.controller;

import com.playmatch.playmatch.dto.ChatMessageResponseDto;
import com.playmatch.playmatch.dto.ChatRoomRequestDto;
import com.playmatch.playmatch.dto.ChatRoomResponseDto;
import com.playmatch.playmatch.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatApiController {

    private final ChatService chatService;

    @PostMapping("/rooms")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ChatRoomResponseDto> findOrCreateRoom(@RequestBody ChatRoomRequestDto requestDto, Principal principal) {
        ChatRoomResponseDto room = chatService.findOrCreateRoom(requestDto.getOtherUserEmail(), principal.getName());
        return ResponseEntity.ok(room);
    }

    @GetMapping("/rooms/{roomId}/messages")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<ChatMessageResponseDto>> getMessages(@PathVariable Long roomId) {
        List<ChatMessageResponseDto> messages = chatService.getMessages(roomId);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/my-rooms")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<ChatRoomResponseDto>> getMyRooms(Principal principal) {
        List<ChatRoomResponseDto> rooms = chatService.getMyRooms(principal.getName());
        return ResponseEntity.ok(rooms);
    }
}

package com.playmatch.playmatch.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class VideoFeedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String videoUrl;
    private LocalDateTime uploadDate;

    // TODO: Consider creating a separate Comment entity if comments need to be managed independently
    @ElementCollection
    private List<String> comments = new ArrayList<>(); // Simple string list for now

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User uploader; // User who uploaded the video feedback

    public VideoFeedback(String title, String description, String videoUrl, User uploader) {
        this.title = title;
        this.description = description;
        this.videoUrl = videoUrl;
        this.uploader = uploader;
        this.uploadDate = LocalDateTime.now();
    }
}


package com.playmatch.playmatch.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "video_feedbacks")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class VideoFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User uploader;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String videoUrl; // 백엔드에서 제공하는 영구적인 URL

    @CreationTimestamp
    @Column(name = "upload_date", nullable = false, updatable = false)
    private LocalDateTime uploadDate;

    @Builder.Default
    @OneToMany(mappedBy = "videoFeedback", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VideoComment> comments = new ArrayList<>();

    // 편의 메서드
    public void addComment(VideoComment comment) {
        this.comments.add(comment);
        comment.setVideoFeedback(this);
    }

    public void update(String title, String description) {
        this.title = title;
        this.description = description;
    }
}
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// Assuming a service for video feedbacks will be created
// import { VideoFeedbackService } from "../../services/api";

interface VideoFeedback {
  id: string;
  title: string;
  videoUrl: string;
  uploadDate: string;
  commentsCount: number;
}

export default function VideoFeedbackListPage() {
  const navigate = useNavigate();
  const [videoFeedbacks, setVideoFeedbacks] = useState<VideoFeedback[]>(
    // Mock data
    // {
    //   id: "1",
    //   title: "경기 영상 피드백 1",
    //   videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    //   uploadDate: "2023-10-26",
    //   commentsCount: 5,
    // },
    // {
    //   id: "2",
    //   title: "슈팅 자세 교정 요청",
    //   videoUrl: "https://www.w3schools.com/html/movie.mp4",
    //   uploadDate: "2023-10-25",
    //   commentsCount: 12,
    // },
  []);

  const handleUploadVideo = () => {
    // Navigate to a page where users can upload a new video feedback
    navigate("/feedback/videos/upload");
  };

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2>영상 피드백</h2>
        <button
          onClick={() => navigate("/feedback/videos/upload")}
          style={{
            padding: "10px 16px",
            backgroundColor: "#16a34a",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          영상 업로드
        </button>
      </div>

      <div style={{ display: "grid", gap: "16px" }}>
        {videoFeedbacks.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666" }}>아직 등록된 영상 피드백이 없습니다.</p>
        ) : (
          videoFeedbacks.map((feedback) => (
            <div
              key={feedback.id}
              style={{
                border: "1px solid #eee",
                borderRadius: "8px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
              onClick={() => navigate(`/feedback/videos/${feedback.id}`)}
            >
              <h3 style={{ margin: 0, fontSize: "1.2em", color: "#333" }}>{feedback.title}</h3>
              <p style={{ margin: 0, fontSize: "0.9em", color: "#777" }}>업로드 날짜: {feedback.uploadDate}</p>
              <p style={{ margin: 0, fontSize: "0.9em", color: "#777" }}>댓글 수: {feedback.commentsCount}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

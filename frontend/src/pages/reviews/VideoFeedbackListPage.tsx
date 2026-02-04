import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { VideoFeedbackService } from "../../services/api";

interface VideoFeedback {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  uploadDate: string;
  commentsCount: number;
}

export default function VideoFeedbackListPage() {
  const navigate = useNavigate();
  const [videoFeedbacks, setVideoFeedbacks] = useState<VideoFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideoFeedbacks = async () => {
      try {
        setLoading(true);
        const data = await VideoFeedbackService.list();
        setVideoFeedbacks(data);
      } catch (err: any) {
        setError(err?.message || "영상 피드백 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchVideoFeedbacks();
  }, []);

  const handleUploadVideo = () => {
    navigate("/feedback/videos/upload");
  };

  if (loading) {
    return <p style={{ textAlign: "center", margin: "24px auto" }}>로딩 중...</p>;
  }

  if (error) {
    return <p style={{ textAlign: "center", margin: "24px auto", color: "crimson" }}>오류: {error}</p>;
  }

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <h2>피드백 게시판</h2>
        <button
          onClick={handleUploadVideo}
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

      {/* 여기에 "영상을 올려주세요" 문구를 추가했습니다. */}
      <p style={{ margin: "0 0 24px 0", fontSize: "1em", color: "#444" }}>나의 베스트 플레이, 함께 분석해 볼까요?</p>
      {/* -------------------------------------------------- */}

      <div style={{ display: "grid", gap: "16px" }}>
        {videoFeedbacks.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666" }}>아직 등록된 영상 피드백이 없습니다.</p>
        ) : (
          videoFeedbacks.map((feedback) => (
            <VideoFeedbackListItem key={feedback.id} feedback={feedback} navigate={navigate} />
          ))
        )}
      </div>
    </div>
  );
}

interface VideoFeedbackListItemProps {
  feedback: VideoFeedback;
  navigate: ReturnType<typeof useNavigate>;
}

const VideoFeedbackListItem: React.FC<VideoFeedbackListItemProps> = ({ feedback, navigate }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
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
        boxShadow: isHovered ? "0 4px 8px rgba(0,0,0,0.1)" : "0 2px 4px rgba(0,0,0,0.05)",
        backgroundColor: isHovered ? "#F0F0F0" : "#fff",
        transition: "all 0.2s ease-in-out",
      }}
      onClick={() => navigate(`/feedback/videos/${feedback.id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3 style={{ margin: 0, fontSize: "1.2em", color: "#333" }}>{feedback.title}</h3>
      <p style={{ margin: 0, fontSize: "0.9em", color: "#777" }}>업로드 날짜: {feedback.uploadDate}</p>
      <p style={{ margin: 0, fontSize: "0.9em", color: "#777" }}>댓글 수: {feedback.commentsCount}</p>
    </div>
  );
};
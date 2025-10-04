import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Assuming a service for video feedbacks will be created
// import { VideoFeedbackService } from "../../services/api";

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

interface VideoFeedbackDetail {
  id: string;
  title: string;
  videoUrl: string;
  description: string;
  uploadDate: string;
  comments: Comment[];
}

export default function VideoFeedbackDetailPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const [videoFeedback, setVideoFeedback] = useState<VideoFeedbackDetail | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [savingComment, setSavingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for a single video feedback (replace with API call)
  useEffect(() => {
    if (videoId) {
      // Simulate fetching data
      const mockData: VideoFeedbackDetail = {
        id: videoId,
        title: `경기 영상 피드백 ${videoId}`,
        videoUrl: videoId === "1" ? "https://www.w3schools.com/html/mov_bbb.mp4" : "https://www.w3schools.com/html/movie.mp4",
        description: `이 영상은 경기 영상 피드백 #${videoId}에 대한 상세 설명입니다. 개선할 점이나 궁금한 점을 댓글로 남겨주세요.`,
        uploadDate: `2023-10-2${videoId}`,
        comments: [
          { id: "c1", author: "사용자 A", text: "정말 좋은 영상입니다!", timestamp: "2023-10-26 10:00" },
          { id: "c2", author: "사용자 B", text: "이 부분에서 패스가 좋았어요.", timestamp: "2023-10-26 10:15" },
        ],
      };
      setVideoFeedback(mockData);
    }
  }, [videoId]);

  const handleAddComment = async () => {
    if (!newCommentText.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    setSavingComment(true);
    try {
      const newComment: Comment = {
        id: Date.now().toString(),
        author: "현재 사용자 (가정)", // In a real app, this would be the logged-in user
        text: newCommentText,
        timestamp: new Date().toLocaleString(),
      };

      // Simulate API call to add comment
      await new Promise(resolve => setTimeout(resolve, 500));

      setVideoFeedback((prev) => {
        if (!prev) return null;
        return { ...prev, comments: [...prev.comments, newComment] };
      });
      setNewCommentText("");
    } catch (err: any) {
      setError(err?.message || "댓글 등록 실패");
    } finally {
      setSavingComment(false);
    }
  };

  if (!videoFeedback) {
    return <div style={{ textAlign: "center", padding: "24px" }}>영상을 찾을 수 없습니다.</div>;
  }

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "24px", color: "#333" }}>{videoFeedback.title}</h2>
      
      <div style={{ marginBottom: "24px" }}>
        <video controls src={videoFeedback.videoUrl} style={{ maxWidth: "100%", borderRadius: "8px" }} />
        <p style={{ fontSize: "0.9em", color: "#777", marginTop: "8px" }}>업로드 날짜: {videoFeedback.uploadDate}</p>
        <p style={{ color: "#555" }}>{videoFeedback.description}</p>
      </div>

      {/* Comments Section */}
      <div style={{ marginTop: "24px", borderTop: "1px solid #eee", paddingTop: "24px" }}>
        <h3 style={{ marginBottom: "16px", color: "#333" }}>댓글</h3>
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <input
            type="text"
            placeholder="댓글을 입력해주세요..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            style={{ flexGrow: 1, padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
          />
          <button
            type="button"
            onClick={handleAddComment}
            disabled={savingComment}
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
            {savingComment ? "등록 중..." : "등록"}
          </button>
        </div>
        <div style={{ display: "grid", gap: "12px" }}>
          {videoFeedback.comments.length === 0 ? (
            <p style={{ color: "#999", textAlign: "center" }}>아직 댓글이 없습니다.</p>
          ) : (
            videoFeedback.comments.map((comment) => (
              <div key={comment.id} style={{ backgroundColor: "#f0f0f0", padding: "12px", borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontWeight: "bold", color: "#333" }}>{comment.author}</span>
                  <span style={{ fontSize: "0.8em", color: "#777" }}>{comment.timestamp}</span>
                </div>
                <p style={{ color: "#555" }}>{comment.text}</p>
              </div>
            ))
          )}
        </div>
        {error && <div style={{ color: "crimson", textAlign: "center", marginTop: "16px" }}>{error}</div>}
      </div>
    </div>
  );
}


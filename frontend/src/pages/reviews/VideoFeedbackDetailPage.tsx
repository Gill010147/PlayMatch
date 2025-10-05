import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { VideoFeedbackService } from "../../services/api";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideoFeedbackDetail = async () => {
      if (!videoId) return;
      try {
        setLoading(true);
        const data = await VideoFeedbackService.detail(videoId);
        if (data) {
          setVideoFeedback(data);
        } else {
          setError("영상을 찾을 수 없습니다.");
        }
      } catch (err: any) {
        setError(err?.message || "영상 상세 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchVideoFeedbackDetail();
  }, [videoId]);

  const handleAddComment = async () => {
    if (!newCommentText.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    setSavingComment(true);
    try {
      // TODO: Implement actual API call for adding comment
      const newComment: Comment = {
        id: Date.now().toString(),
        author: "현재 사용자 (가정)", // In a real app, this would be the logged-in user
        text: newCommentText,
        timestamp: new Date().toLocaleString(),
      };

      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

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

  if (loading) {
    return <p style={{ textAlign: "center", margin: "24px auto" }}>로딩 중...</p>;
  }

  if (error) {
    return <p style={{ textAlign: "center", margin: "24px auto", color: "crimson" }}>오류: {error}</p>;
  }

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



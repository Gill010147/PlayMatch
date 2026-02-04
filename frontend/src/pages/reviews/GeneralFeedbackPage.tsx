import React, { useState } from "react";
import { ReviewsService } from "../../services/api";

// interface Comment {
//   id: string;
//   author: string;
//   text: string;
//   timestamp: string;
// }

export default function GeneralFeedbackPage() {
  const [feedbackType, setFeedbackType] = useState<"bug" | "feature" | "improvement" | "other">("bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  // const [videoFile, setVideoFile] = useState<File | null>(null);
  // const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  // const [comments, setComments] = useState<Comment[]>([]);
  // const [newCommentText, setNewCommentText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files[0]) {
  //     const file = e.target.files[0];
  //     // Basic validation for video files (you can extend this)
  //     if (!file.type.startsWith("video/")) {
  //       alert("비디오 파일만 업로드 가능합니다.");
  //       e.target.value = "";
  //       setVideoFile(null);
  //       setVideoPreviewUrl(null);
  //       return;
  //     }
  //     setVideoFile(file);
  //     setVideoPreviewUrl(URL.createObjectURL(file));
  //   } else {
  //     setVideoFile(null);
  //     setVideoPreviewUrl(null);
  //   }
  // };

  // const handleAddComment = () => {
  //   if (newCommentText.trim()) {
  //     const newComment: Comment = {
  //       id: Date.now().toString(),
  //       author: "현재 사용자 (가정)", // In a real app, this would be the logged-in user
  //       text: newCommentText,
  //       timestamp: new Date().toLocaleString(),
  //     };
  //     setComments((prevComments) => [...prevComments, newComment]);
  //     setNewCommentText("");
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("제목과 내용을 모두 입력해주세요.");
      return;
    }
    
    setSaving(true);
    setError(null);
    try {
      // 피드백 데이터를 리뷰 서비스에 저장 (임시)
      await ReviewsService.create({ 
        targetType: "feedback", 
        targetId: "system", 
        rating: priority === "high" ? 5 : priority === "medium" ? 3 : 1, 
        comment: `[${feedbackType.toUpperCase()}] ${title}\n\n${description}` 
      });
      alert("피드백이 전송되었습니다. 소중한 의견 감사합니다!");
      setTitle("");
      setDescription("");
      // setVideoFile(null);
      // setVideoPreviewUrl(null);
      // setComments([]); // Clear comments after submission
      // setNewCommentText("");
    } catch (err: any) {
      setError(err?.message || "전송 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px" }}>
      <h2>피드백 보내기</h2>
      <p style={{ color: "#666", marginBottom: "24px" }}>
        PlayMatch 서비스 개선을 위한 소중한 의견을 보내주세요.
      </p>
      
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
        {/* <div style={{ display: "grid", gap: 8 }}>
          <label style={{ fontWeight: "500" }}>영상 첨부 (선택 사항)</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
          />
          {videoPreviewUrl && (
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <video controls src={videoPreviewUrl} style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "8px" }} />
            </div>
          )}
        </div> */}

        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ fontWeight: "500" }}>피드백 유형</label>
          <select 
            value={feedbackType} 
            onChange={(e) => setFeedbackType(e.target.value as any)}
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
          >
            <option value="bug">버그 신고</option>
            <option value="feature">기능 제안</option>
            <option value="improvement">개선 사항</option>
            <option value="other">기타</option>
          </select>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ fontWeight: "500" }}>우선순위</label>
          <select 
            value={priority} 
            onChange={(e) => setPriority(e.target.value as any)}
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
          >
            <option value="low">낮음</option>
            <option value="medium">보통</option>
            <option value="high">높음</option>
          </select>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ fontWeight: "500" }}>제목 *</label>
          <input 
            placeholder="피드백 제목을 입력해주세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
            required
          />
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ fontWeight: "500" }}>내용 *</label>
          <textarea 
            placeholder="자세한 내용을 입력해주세요"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            style={{ 
              padding: "10px", 
              borderRadius: "8px", 
              border: "1px solid #ddd",
              resize: "vertical",
              fontFamily: "inherit"
            }}
            required
          />
        </div>

        {/* Comments Section */}
        {/* <div style={{ marginTop: "24px", borderTop: "1px solid #eee", paddingTop: "24px" }}>
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
              type="button" // Important to prevent form submission
              onClick={handleAddComment}
              style={{
                padding: "10px 16px",
                backgroundColor: "#16a34a", // Use the consistent green color
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              등록
            </button>
          </div>
          <div style={{ display: "grid", gap: "12px" }}>
            {comments.length === 0 ? (
              <p style={{ color: "#999", textAlign: "center" }}>아직 댓글이 없습니다.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} style={{ backgroundColor: "#f0f0f0", padding: "12px", borderRadius: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px"}>
                    <span style={{ fontWeight: "bold", color: "#333" }}>{comment.author}</span>
                    <span style={{ fontSize: "0.8em", color: "#777" }}>{comment.timestamp}</span>
                  </div>
                  <p style={{ color: "#555" }}>{comment.text}</p>
                </div>
              ))
            )}
          </div>
        </div> */}

        <button 
          type="submit" 
          disabled={saving}
          style={{
            padding: "12px 18px",
            backgroundColor: "rgba(70, 55, 238, 1)",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "16px"
          }}
        >
          {saving ? "전송 중…" : "피드백 전송"}
        </button>
        
        {error && <div style={{ color: "crimson", textAlign: "center" }}>{error}</div>}
      </form>
    </div>
  );
}













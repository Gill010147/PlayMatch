import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { VideoFeedbackService, AuthService } from "../../services/api";
import { VideoFeedbackDetail, Comment, UserProfile } from "../../types/domain";

// 날짜/시간 포맷팅 헬퍼 함수
const formatDateTime = (dateTimeString: string) => {
  const date = new Date(dateTimeString);
  return date.toLocaleString();
};

export default function VideoFeedbackDetailPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const [videoFeedback, setVideoFeedback] = useState<VideoFeedbackDetail | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [savingComment, setSavingComment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // 영상 피드백 수정 관련 상태
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  // 댓글 수정 관련 상태
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedCommentText, setEditedCommentText] = useState("");

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user: UserProfile = await AuthService.me();
        if (user && user.id) {
          setCurrentUserId(Number(user.id));
        } else {
          console.error("User ID not found in profile response.");
          setCurrentUserId(null);
        }
      } catch (error) {
        console.error("현재 사용자 정보 로드 실패:", error);
        setCurrentUserId(null);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchVideoFeedbackDetail = async () => {
      if (!videoId) return;
      try {
        setLoading(true);
        const data: VideoFeedbackDetail = await VideoFeedbackService.detail(videoId);
        if (data) {
          setVideoFeedback(data);
          setEditedTitle(data.title);
          setEditedDescription(data.description);
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
      const addedComment: Comment = await VideoFeedbackService.addComment(videoId!, newCommentText);

      setVideoFeedback((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          comments: [...(prev.comments || []), addedComment],
        };
      });
      setNewCommentText("");
    } catch (err: any) {
      setError(err?.message || "댓글 등록 실패");
    } finally {
      setSavingComment(false);
    }
  };

  const handleDeleteVideoFeedback = async () => {
    if (!videoFeedback || !videoId) return;
    if (!window.confirm("정말로 이 영상을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await VideoFeedbackService.deleteVideoFeedback(videoId);
      alert("영상이 성공적으로 삭제되었습니다.");
      navigate("/feedback/videos");
    } catch (err: any) {
      setError(err?.message || "영상 삭제 실패");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!videoFeedback || !videoId) return;
    if (!window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await VideoFeedbackService.deleteComment(videoId, commentId);
      alert("댓글이 성공적으로 삭제되었습니다.");
      setVideoFeedback((prev) => {
        if (!prev) return null;
        return { ...prev, comments: prev.comments.filter(comment => comment.id !== commentId) };
      });
    } catch (err: any) {
      setError(err?.message || "댓글 삭제 실패");
    }
  };

  const handleEditVideoFeedback = () => {
    setIsEditingVideo(true);
  };

  const handleSaveVideoFeedback = async () => {
    if (!videoFeedback || !videoId) return;
    if (!editedTitle.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    try {
      const updatedData = await VideoFeedbackService.updateVideoFeedback(videoId, {
        title: editedTitle,
        description: editedDescription,
      });
      setVideoFeedback((prev) => (prev ? { ...prev, title: updatedData.title, description: updatedData.description } : null));
      setIsEditingVideo(false);
      alert("영상이 성공적으로 수정되었습니다.");
    } catch (err: any) {
      setError(err?.message || "영상 수정 실패");
    }
  };

  const handleCancelEditVideoFeedback = () => {
    if (videoFeedback) {
      setEditedTitle(videoFeedback.title);
      setEditedDescription(videoFeedback.description);
    }
    setIsEditingVideo(false);
  };

  const handleEditComment = (commentId: string, currentText: string) => {
    setEditingCommentId(commentId);
    setEditedCommentText(currentText);
  };

  const handleSaveComment = async (commentId: string) => {
    if (!editedCommentText.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      const updatedComment = await VideoFeedbackService.updateComment(videoId!, commentId, editedCommentText);
      setVideoFeedback((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          comments: prev.comments.map(comment =>
              comment.id === commentId ? { ...comment, text: updatedComment.text } : comment
          ),
        };
      });
      setEditingCommentId(null);
      setEditedCommentText("");
      alert("댓글이 성공적으로 수정되었습니다.");
    } catch (err: any) {
      setError(err?.message || "댓글 수정 실패");
    }
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditedCommentText("");
  };

  if (loading || currentUserId === null) {
    return <p style={{ textAlign: "center", margin: "24px auto" }}>로딩 중...</p>;
  }

  if (error) {
    return <p style={{ textAlign: "center", margin: "24px auto", color: "crimson" }}>오류: {error}</p>;
  }

  if (!videoFeedback) {
    return <div style={{ textAlign: "center", padding: "24px" }}>영상을 찾을 수 없습니다.</div>;
  }

  console.log("Video URL for playback:", videoFeedback.videoUrl);

  const isUploader = currentUserId === videoFeedback.uploaderId;

  return (
      <div style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <button onClick={() => navigate("/feedback/videos")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2em", color: "#555" }}>
            ← 돌아가기
          </button>
          {isEditingVideo ? (
              <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  style={{ flexGrow: 1, padding: "8px", fontSize: "1.5em", border: "1px solid #ddd", borderRadius: "4px" }}
              />
          ) : (
              <h2 style={{ margin: 0, color: "#333" }}>{videoFeedback.title}</h2>
          )}
          {isUploader && (
              <div style={{ display: "flex", gap: "8px" }}>
                {isEditingVideo ? (
                    <>
                      <button onClick={handleSaveVideoFeedback} style={{ padding: "8px 12px", backgroundColor: "#16a34a", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>저장</button>
                      <button onClick={handleCancelEditVideoFeedback} style={{ padding: "8px 12px", backgroundColor: "#F44336", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>취소</button>
                    </>
                ) : (
                    <>
                      <button onClick={handleEditVideoFeedback} style={{ padding: "8px 12px", backgroundColor: "#2196F3", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>수정</button>
                      <button onClick={handleDeleteVideoFeedback} style={{ padding: "8px 12px", backgroundColor: "#F44336", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>삭제</button>
                    </>
                )}
              </div>
          )}
        </div>

        <div style={{ marginBottom: "24px" }}>
          {videoFeedback.videoUrl ? (
              <video controls src={videoFeedback.videoUrl} style={{ maxWidth: "100%", borderRadius: "8px" }} />
          ) : (
              <p style={{ textAlign: "center", color: "#999" }}>영상을 불러올 수 없습니다.</p>
          )}
          <p style={{ fontSize: "0.9em", color: "#777", marginTop: "8px" }}>업로드 날짜: {formatDateTime(videoFeedback.uploadDate)}</p>
          {isEditingVideo ? (
              <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  style={{ width: "100%", minHeight: "100px", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
              />
          ) : (
              <p style={{ color: "#555" }}>{videoFeedback.description}</p>
          )}
          <p style={{ fontSize: "0.9em", color: "#777", marginTop: "8px" }}>업로더: {videoFeedback.uploaderName}</p>
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
                videoFeedback.comments.map((comment) => {
                  // 🔍 디버깅 로그 추가
                  console.log("Comment ID:", comment.id, "Author ID:", comment.authorId, "Current User ID:", currentUserId);

                  return (
                      <div key={comment.id} style={{ backgroundColor: "#f0f0f0", padding: "12px", borderRadius: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <span style={{ fontWeight: "bold", color: "#333" }}>{comment.authorName}</span>
                          <span style={{ fontSize: "0.8em", color: "#777" }}>{formatDateTime(comment.createdAt)}</span>
                          {currentUserId === comment.authorId && (
                              <div style={{ display: "flex", gap: "4px" }}>
                                <button
                                    onClick={() => handleEditComment(comment.id, comment.text)}
                                    style={{ background: "none", border: "none", color: "#2196F3", cursor: "pointer", fontSize: "0.8em" }}
                                >
                                  수정
                                </button>
                                <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    style={{ background: "none", border: "none", color: "#F44336", cursor: "pointer", fontSize: "0.8em" }}
                                >
                                  삭제
                                </button>
                              </div>
                          )}
                        </div>
                        {editingCommentId === comment.id ? (
                            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                              <input
                                  type="text"
                                  value={editedCommentText}
                                  onChange={(e) => setEditedCommentText(e.target.value)}
                                  style={{ flexGrow: 1, padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                              />
                              <button
                                  onClick={() => handleSaveComment(comment.id)}
                                  style={{ padding: "8px 12px", backgroundColor: "#16a34a", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                              >
                                저장
                              </button>
                              <button
                                  onClick={handleCancelEditComment}
                                  style={{ padding: "8px 12px", backgroundColor: "#F44336", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                              >
                                취소
                              </button>
                            </div>
                        ) : (
                            <p style={{ color: "#555" }}>{comment.text}</p>
                        )}
                      </div>
                  );
                })
            )}
          </div>
          {error && <div style={{ color: "crimson", textAlign: "center", marginTop: "16px" }}>{error}</div>}
        </div>
      </div>
  );
}

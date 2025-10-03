import React, { useState, useEffect } from "react";
import { ReviewsService } from "../../services/api";
import { VideoPost, Comment } from "../../types/domain"; // Import VideoPost and Comment interface

export default function FeedbackPage() {
  const [feedbackType, setFeedbackType] = useState<"bug" | "feature" | "improvement" | "other">("bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoPosts, setVideoPosts] = useState<VideoPost[]>([]); // State for video posts
  const [showUploadForm, setShowUploadForm] = useState(false); // State to toggle upload form
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostVideoFile, setNewPostVideoFile] = useState<File | null>(null); // State for video file

  // Function to fetch video posts (dummy for now)
  const fetchVideoPosts = async () => {
    // In a real application, you would fetch video posts from an API
    setVideoPosts([]);
  };

  useEffect(() => {
    fetchVideoPosts();
  }, []);

  const handleVideoPostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostVideoFile) {
      setError("제목과 영상을 모두 입력해주세요.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      // Here, you would send the new post data to your backend
      // For now, let's simulate adding a new post
      const newPost: VideoPost = {
        id: String(videoPosts.length + 1),
        title: newPostTitle,
        videoUrl: URL.createObjectURL(newPostVideoFile), // Simulate video URL for now
        comments: [],
      };
      setVideoPosts((prevPosts) => [...prevPosts, newPost]);
      setNewPostTitle("");
      setNewPostVideoFile(null);
      setShowUploadForm(false);
      alert("게시글이 성공적으로 업로드되었습니다!");
    } catch (err: any) {
      setError(err?.message || "게시글 업로드 실패");
    } finally {
      setSaving(false);
    }
  };

  const [newCommentText, setNewCommentText] = useState<{ [postId: string]: string }>({});

  const handleCommentSubmit = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const commentContent = newCommentText[postId];
    if (!commentContent.trim()) {
      setError("댓글 내용을 입력해주세요.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      // Here, you would send the new comment data to your backend
      // For now, let's simulate adding a new comment
      const postToUpdate = videoPosts.find(post => post.id === postId);
      const newComment: Comment = {
        id: String((postToUpdate?.comments.length || 0) + 1), // Simple ID generation
        userId: "currentUserId", // Placeholder for current user ID
        userName: "익명", // Placeholder for user name
        content: commentContent,
        createdAt: new Date().toISOString(),
      };
      setVideoPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: [...post.comments, newComment] }
            : post
        )
      );
      setNewCommentText((prev) => ({ ...prev, [postId]: "" }));
      alert("댓글이 성공적으로 등록되었습니다!");
    } catch (err: any) {
      setError(err?.message || "댓글 등록 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px" }}>
      <h2>피드백 게시판</h2>
      <p style={{ color: "#666", marginBottom: "24px" }}>
        자신이 플레이한 영상을 올리고 다른 사람들과 피드백을 주고받으세요.
      </p>

      <button
        onClick={() => setShowUploadForm(!showUploadForm)}
        style={{
          padding: "10px 15px",
          backgroundColor: "rgba(70, 55, 238, 1)",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "600",
          marginBottom: "20px",
        }}
      >
        {showUploadForm ? "업로드 폼 닫기" : "새 영상 게시글 올리기"}
      </button>

      {showUploadForm && (
        <form onSubmit={handleVideoPostSubmit} style={{ display: "grid", gap: 16, marginBottom: "40px", border: "1px solid #ddd", padding: "20px", borderRadius: "10px" }}>
          <h3>새 영상 게시글</h3>
          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ fontWeight: "500" }}>제목 *</label>
            <input
              placeholder="게시글 제목을 입력해주세요"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
              required
            />
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ fontWeight: "500" }}>영상 파일 *</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setNewPostVideoFile(e.target.files?.[0] || null)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
              required
            />
          </div>
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
              fontSize: "16px",
            }}
          >
            {saving ? "업로드 중…" : "게시글 업로드"}
          </button>
          {error && <div style={{ color: "crimson", textAlign: "center" }}>{error}</div>}
        </form>
      )}

      <h3>영상 게시글 목록</h3>
      {videoPosts.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666" }}>아직 게시글이 없습니다. 첫 게시글을 올려보세요!</p>
      ) : (
        <div style={{ display: "grid", gap: 24 }}>
          {videoPosts.map((post) => (
            <div key={post.id} style={{ border: "1px solid #eee", borderRadius: "10px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <h4 style={{ marginBottom: "10px" }}>{post.title}</h4>
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", marginBottom: "15px" }}>
                {post.videoUrl && post.videoUrl.startsWith("blob:") ? (
                  <video
                    controls
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                    src={post.videoUrl}
                  />
                ) : (
                  <iframe
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                    src={post.videoUrl.replace("watch?v=", "embed/")}
                    title={post.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                )}
              </div>
              <p style={{ fontSize: "14px", color: "#888", marginBottom: "15px" }}>댓글: {post.comments.length}</p>

              {/* 댓글 목록 */}
              <div style={{ borderTop: "1px solid #eee", paddingTop: "15px", marginTop: "15px" }}>
                {post.comments.length === 0 ? (
                  <p style={{ fontSize: "14px", color: "#999" }}>아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
                ) : (
                  <div style={{ display: "grid", gap: 10 }}>
                    {post.comments.map((comment) => (
                      <div key={comment.id} style={{ backgroundColor: "#f9f9f9", padding: "10px", borderRadius: "8px" }}>
                        <p style={{ fontSize: "14px", fontWeight: "500", marginBottom: "5px" }}>{comment.userName}</p>
                        <p style={{ fontSize: "14px" }}>{comment.content}</p>
                        <p style={{ fontSize: "12px", color: "#aaa", textAlign: "right" }}>{new Date(comment.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 댓글 작성 폼 */}
              <form onSubmit={(e) => handleCommentSubmit(e, post.id)} style={{ display: "flex", gap: 10, marginTop: "15px" }}>
                <input
                  type="text"
                  placeholder="댓글을 입력하세요..."
                  value={newCommentText[post.id] || ""}
                  onChange={(e) => setNewCommentText({ ...newCommentText, [post.id]: e.target.value })}
                  style={{
                    flexGrow: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                  }}
                  required
                />
                <button
                  type="submit"
                  style={{
                    padding: "10px 15px",
                    backgroundColor: "#5cb85c",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  댓글 달기
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}













import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { VideoFeedbackService } from "../../services/api"; // Will be used for API call

export default function VideoFeedbackUploadPage() {
  const navigate = useNavigate();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("video/")) {
        alert("비디오 파일만 업로드 가능합니다.");
        e.target.value = "";
        setVideoFile(null);
        setVideoPreviewUrl(null);
        return;
      }
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
    } else {
      setVideoFile(null);
      setVideoPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile || !title.trim() || !description.trim()) {
      setError("모든 필드를 입력하고 영상을 첨부해주세요.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await VideoFeedbackService.uploadVideoFeedback({ title, description, videoFile });
      alert("영상 피드백이 성공적으로 업로드되었습니다.");
      navigate("/feedback/videos");
    } catch (err: any) {
      setError(err?.message || "영상 업로드 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "24px", color: "#333" }}>영상 피드백 업로드</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
        <div>
          <label htmlFor="videoFile" style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>영상 파일:</label>
          <input
            type="file"
            id="videoFile"
            accept="video/*"
            onChange={handleVideoChange}
            style={{ border: "1px solid #ddd", padding: "8px", borderRadius: "4px", width: "100%" }}
            required
          />
          {videoPreviewUrl && (
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <video controls src={videoPreviewUrl} style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "8px" }} />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="title" style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>제목:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="영상 제목을 입력해주세요."
            style={{ border: "1px solid #ddd", padding: "8px", borderRadius: "4px", width: "100%" }}
            required
          />
        </div>

        <div>
          <label htmlFor="description" style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>간단한 내용:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="영상에 대한 간단한 설명을 입력해주세요."
            rows={5}
            style={{ border: "1px solid #ddd", padding: "8px", borderRadius: "4px", width: "100%", resize: "vertical" }}
            required
          ></textarea>
        </div>

        <button
          type="submit"
          style={{
            padding: "12px 18px",
            backgroundColor: "#16a34a",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
          disabled={saving}
        >
          {saving ? "업로드 중..." : "영상 업로드"}
        </button>
        {error && <div style={{ color: "crimson", textAlign: "center", marginTop: "16px" }}>{error}</div>}
      </form>
    </div>
  );
}



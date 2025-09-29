import React, { useState } from "react";
import { ReviewsService } from "../../services/api";

export default function CreateReviewPage() {
  const [targetType, setTargetType] = useState<"user" | "team">("user");
  const [targetId, setTargetId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await ReviewsService.create({ targetType, targetId, rating, comment });
      alert("리뷰 저장 (데모)");
    } catch (err: any) {
      setError(err?.message || "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px" }}>
      <h2>리뷰 작성</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <select value={targetType} onChange={(e) => setTargetType(e.target.value as any)}>
          <option value="user">사용자</option>
          <option value="team">팀</option>
        </select>
        <input placeholder="대상 ID" value={targetId} onChange={(e) => setTargetId(e.target.value)} />
        <input type="number" min={1} max={5} value={rating} onChange={(e) => setRating(Number(e.target.value))} />
        <textarea placeholder="코멘트" value={comment} onChange={(e) => setComment(e.target.value)} />
        <button type="submit" disabled={saving}>{saving ? "저장 중…" : "저장"}</button>
        {error && <div style={{ color: "crimson" }}>{error}</div>}
      </form>
    </div>
  );
}






import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ReviewsService } from "../../services/api";
import type { Review } from "../../types/domain";

export default function UserReviewsPage() {
  const { userId } = useParams<{ userId: string }>();
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    setLoading(true);
    ReviewsService.listUser(userId)
      .then((list: any) => { if (mounted) setItems(Array.isArray(list) ? list : []); })
      .catch((e) => { if (mounted) setError(e?.message || "불러오지 못했습니다."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [userId]);

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px" }}>
      <h2>사용자 리뷰</h2>
      {loading && <div>불러오는 중…</div>}
      {error && <div style={{ color: "crimson" }}>{error}</div>}
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
        {items.map((r) => (
          <li key={r.id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
            <div>평점: {r.rating}</div>
            <div>{r.comment}</div>
            <div style={{ color: "#666" }}>{r.createdAt}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}






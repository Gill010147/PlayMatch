import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MatchesService } from "../../services/api";
import type { MatchDetail } from "../../types/domain";

export default function MatchDetailPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const [data, setData] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applyLoading, setApplyLoading] = useState(false);

  useEffect(() => {
    if (!matchId) return;
    let mounted = true;
    setLoading(true);
    setError(null);
    MatchesService.detail(matchId)
      .then((d: any) => {
        if (!mounted) return;
        setData(d || null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || "상세 정보를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => { mounted = false; };
  }, [matchId]);

  const handleApply = async () => {
    if (!matchId) return;
    setApplyLoading(true);
    try {
      await MatchesService.applyAsMercenary(matchId, {});
      alert("신청 완료 (데모)");
    } catch (e: any) {
      alert(e?.message || "신청 실패");
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 16 }}>불러오는 중…</div>;
  if (error) return <div style={{ padding: 16, color: "crimson" }}>{error}</div>;
  if (!data) return <div style={{ padding: 16 }}>데이터가 없습니다.</div>;

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px", display: "grid", gap: 12 }}>
      <h2>경기 상세</h2>
      <div><strong>{data.title}</strong></div>
      <div style={{ color: "#666" }}>{new Date(data.matchDate).toLocaleString()} • {data.locationName}</div>
      {data.description && <p>{data.description}</p>}
      <div>
        <button onClick={handleApply} disabled={applyLoading || data.status !== "open"}>
          {data.status === "open" ? (applyLoading ? "신청 중…" : "용병 신청") : "마감됨"}
        </button>
      </div>
    </div>
  );
}





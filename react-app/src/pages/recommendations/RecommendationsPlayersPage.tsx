import React, { useState } from "react";
import { RecommendationsService } from "../../services/api";

export default function RecommendationsPlayersPage() {
  const [criteria, setCriteria] = useState<{ position?: string; region?: string; date?: string }>({});
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const list: any = await RecommendationsService.recommendPlayers(criteria);
      setResults(Array.isArray(list) ? list : []);
    } catch (err: any) {
      setError(err?.message || "추천 요청 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: "24px auto", padding: "0 16px" }}>
      <h2>용병 추천 요청</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <input placeholder="포지션" value={criteria.position || ""} onChange={(e) => setCriteria((c) => ({ ...c, position: e.target.value }))} />
        <input placeholder="지역" value={criteria.region || ""} onChange={(e) => setCriteria((c) => ({ ...c, region: e.target.value }))} />
        <input type="date" value={criteria.date || ""} onChange={(e) => setCriteria((c) => ({ ...c, date: e.target.value }))} />
        <button type="submit" style={{ gridColumn: "1 / span 3", justifySelf: "start" }}>추천 받기</button>
      </form>

      {loading && <div style={{ marginTop: 16 }}>불러오는 중…</div>}
      {error && <div style={{ marginTop: 16, color: "crimson" }}>{error}</div>}

      <ul style={{ listStyle: "none", padding: 0, marginTop: 16, display: "grid", gap: 12 }}>
        {results.map((r: any, idx: number) => (
          <li key={r.id || idx} style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
            {JSON.stringify(r)}
          </li>
        ))}
      </ul>
    </div>
  );
}

















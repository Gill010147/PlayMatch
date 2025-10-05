import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MatchesService } from "../../services/api";
import type { MatchResponseDto } from "../../types/domain";
import RecommendedMatchList from "../../components/recommendmatch";
import KakaoMap from "../../components/kakaomap";

// MatchResponseDto를 KakaoMap 및 RecommendedMatchList에서 사용하는 Match 인터페이스에 맞게 매핑
interface DisplayMatch {
  id: string;
  time: string;
  location: string;
  type: string;
  teams: string; // hostTeamName을 사용
  status: "open" | "closed"; // MatchStatus를 "open" 또는 "closed"로 매핑
}

// 날짜/시간 포맷팅 유틸리티 함수
const formatDateTime = (dateTimeString: string) => {
  const date = new Date(dateTimeString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export default function MatchesListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<{ region?: string; date?: string; time?: string }>({});
  const [items, setItems] = useState<MatchResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    MatchesService.list(filters)
      .then((list: any) => {
        if (!mounted) return;
        setItems(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || "목록을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [filters]);

  // MatchesResponseDto를 DisplayMatch로 변환
  const displayMatches: DisplayMatch[] = items.map(item => ({
    id: String(item.id),
    time: formatDateTime(item.matchDate),
    location: item.locationName,
    type: item.matchType,
    teams: item.hostTeamName || "", // hostTeamName이 없을 경우 빈 문자열
    status: item.status === "RECRUITING" ? "open" : "closed", // MatchStatus 매핑
  }));

  return (
    <div style={{ maxWidth: 960, margin: "24px auto", padding: "0 16px" }}>
      <h2>경기 목록</h2>
      
      

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, margin: "12px 0 20px" }}>
        <input placeholder="지역" value={filters.region || ""} onChange={(e) => setFilters((f) => ({ ...f, region: e.target.value }))} />
        <input type="date" value={filters.date || ""} onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))} />
        <input type="time" value={filters.time || ""} onChange={(e) => setFilters((f) => ({ ...f, time: e.target.value }))} />
      </div>

      {loading && <div>불러오는 중…</div>}
      {error && <div style={{ color: "crimson" }}>{error}</div>}

      <ul style={{ display: "grid", gap: 12, listStyle: "none", padding: 0 }}>
        {items.map((m) => (
          <li key={m.id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 12, display: "grid", gap: 6 }}>
            <div style={{ fontWeight: 600 }}>{m.title} ({m.status})</div>
            <div style={{ color: "#666" }}>
              {formatDateTime(m.matchDate)} • {m.locationName} • {m.hostTeamName}
            </div>
            <div style={{ color: "#666" }}>
              인원: {m.memberCount} / {m.maxMemberCount}
            </div>
            <button onClick={() => navigate(`/matches/${m.id}`)} style={{ justifySelf: "start" }}>상세보기</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

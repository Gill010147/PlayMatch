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

// 헬퍼 함수: 매치 상태 텍스트 반환
const getMatchStatusText = (status: string) => {
  switch (status) {
    case 'RECRUITING': return '모집중';
    case 'RECRUITMENT_COMPLETE': return '모집완료';
    case 'COMPLETED': return '마감됨';
    case 'CANCELLED': return '경기취소';
    default: return '알 수 없음';
  }
};

// 헬퍼 함수: 매치 상태 색상 반환
const getMatchStatusColor = (status: string) => {
  switch (status) {
    case 'RECRUITING': return '#4CAF50'; // Green
    case 'RECRUITMENT_COMPLETE': return '#2196F3'; // Blue
    case 'COMPLETED': return '#FF9800'; // Orange
    case 'CANCELLED': return '#F44336'; // Red
    default: return '#9E9E9E'; // Grey
  }
};

export default function MatchesListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<{ region?: string; date?: string; title?: string }>({});
  const [items, setItems] = useState<MatchResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 검색 버튼 클릭 시 필터 적용
  const handleSearch = () => {
    // filters 상태가 변경되면 useEffect가 다시 실행되어 목록을 불러옴
    // 현재는 filters가 변경될 때마다 useEffect가 실행되므로 별도의 handleSearch 로직은 필요 없음
    // 하지만 명시적인 검색 버튼을 위해 더미 함수를 남겨둠
  };

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
        <input
          placeholder="지역"
          value={filters.region || ""}
          onChange={(e) => setFilters((f) => ({ ...f, region: e.target.value }))}
          style={{
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "14px",
            outline: "none",
          }}
        />
        <input
          type="date"
          value={filters.date || ""}
          onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))}
          style={{
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "14px",
            outline: "none",
          }}
        />
        <input
          placeholder="제목"
          value={filters.title || ""}
          onChange={(e) => setFilters((f) => ({ ...f, title: e.target.value }))}
          style={{
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "14px",
            outline: "none",
          }}
        />
      </div>

      {loading && <div>불러오는 중…</div>}
      {error && <div style={{ color: "crimson" }}>{error}</div>}

      <ul style={{ display: "grid", gap: 12, listStyle: "none", padding: 0 }}>
        {items.map((m) => (
          <li key={m.id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 12, display: "grid", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                backgroundColor: getMatchStatusColor(m.status),
                color: "#fff",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: "600",
              }}>{getMatchStatusText(m.status)}</span>
              <div style={{ fontWeight: 600 }}>{m.title}</div>
            </div>
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

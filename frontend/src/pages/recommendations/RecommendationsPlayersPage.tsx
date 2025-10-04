import React, { useEffect, useState } from "react";
import { RecommendationsService } from "../../services/api";
import { POSITIONS, PLAY_STYLES, PLAYER_SKILLS } from "../../constants/playerOptions"; 
import { useNavigate } from "react-router-dom";
// 위 세 개는 네가 만든 상수 배열 파일에서 export 해두면 깔끔함

export default function RecommendationsPlayersPage() {
  const [criteria, setCriteria] = useState<{
    position?: string;
    playStyles: string[];
    skills: string[];
  }>({
    playStyles: [],
    skills: [],
  });
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("RecommendationsPlayersPage - VITE_USE_MOCKS:", import.meta.env.VITE_USE_MOCKS);
  }, []);

  const navigate = useNavigate();

  const toggleValue = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    console.log("Searching with criteria:", criteria);
    try {
      const list: any = await RecommendationsService.recommendPlayers(criteria);
      setResults(Array.isArray(list) ? list : []);
      console.log("API returned results:", list);
    } catch (err: any) {
      console.error("Error fetching recommendations:", err);
      setError(err?.message || "추천 요청 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: "24px auto", padding: "0 16px" }}>
      <h2>⚽ 원하는 선수 유형을 선택해주세요!</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: 24, marginTop: 16 }}
      >
        {/* 포지션 */}
        <div>
          <span style={{ fontWeight: "600" }}>포지션</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {POSITIONS.map((opt) => {
              const selected = criteria.position === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setCriteria((c) => ({ ...c, position: opt }))}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: `1px solid ${selected ? "blue" : "#ccc"}`,
                    backgroundColor: selected ? "#e0f7fa" : "#fff",
                    cursor: "pointer",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* 플레이 스타일 */}
        <div>
          <span style={{ fontWeight: "600" }}>플레이 스타일</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {PLAY_STYLES.map((opt) => {
              const selected = criteria.playStyles.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() =>
                    setCriteria((c) => ({
                      ...c,
                      playStyles: toggleValue(c.playStyles, opt),
                    }))
                  }
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: `1px solid ${selected ? "blue" : "#ccc"}`,
                    backgroundColor: selected ? "#d7efff" : "#fff",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* 자신 있는 능력 */}
        <div>
          <span style={{ fontWeight: "600" }}>자신 있는 능력</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {PLAYER_SKILLS.map((opt) => {
              const selected = criteria.skills.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() =>
                    setCriteria((c) => ({
                      ...c,
                      skills: toggleValue(c.skills, opt),
                    }))
                  }
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: `1px solid ${selected ? "blue" : "#ccc"}`,
                    backgroundColor: selected ? "#e6f5ff" : "#fff",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* 버튼 */}
        <button
          type="submit"
          style={{
            padding: "10px 24px",
            borderRadius: "8px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            fontSize: "1rem",
            width: "fit-content",
          }}
        >
          선수 찾기
        </button>
      </form>

      {/* 결과 */}
      {loading && <div style={{ marginTop: 16 }}>불러오는 중…</div>}
      {error && <div style={{ marginTop: 16, color: "crimson" }}>{error}</div>}

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          marginTop: 24,
          display: "grid",
          gap: 12,
        }}
      >
        {results.map((r: any, idx: number) => (
          <li
            key={r.id || idx}
            onClick={() => navigate(`/recommendations/players/${idx}`)}
            style={{
              border: "1px solid #eee",
              borderRadius: 8,
              padding: 12,
              cursor: "pointer",
            }}
          >
            <div>Name: {r.name}</div>
            <div>Position: {r.position}</div>
            <div>Play Style: {r.playStyle.join(', ')}</div>
            <div>Skills: {r.skills.join(', ')}</div>
            <div>Region: {r.region}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

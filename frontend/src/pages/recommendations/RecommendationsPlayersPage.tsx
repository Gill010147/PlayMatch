import React, { useEffect, useState } from "react";
import { RecommendationsService } from "../../services/api";
import { POSITIONS, PLAY_STYLES, PLAYER_SKILLS } from "../../constants/playerOptions"; 
import { useNavigate } from "react-router-dom";
import "../SignupPage.css"; // SignupPage.css import

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
    <div className="signup-container">
      <h2 className="form-title">⚽ 원하는 선수 유형을 선택해주세요!</h2>
      <form
        onSubmit={handleSubmit}
        className="signup-form"
      >
        {/* 포지션 */}
        <div className="field">
          <span className="label">포지션</span>
          <div className="field-group row gap grid-4">
            {POSITIONS.map((opt) => {
              const selected = criteria.position === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setCriteria((c) => ({ ...c, position: opt }))}
                  className={`chip ${selected ? "selected" : ""}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* 플레이 스타일 */}
        <div className="field">
          <span className="label">플레이 스타일</span>
          <div className="field-group row gap grid-4">
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
                  className={`chip ${selected ? "selected" : ""}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* 자신 있는 능력 */}
        <div className="field">
          <span className="label">자신 있는 능력</span>
          <div className="field-group row gap grid-4">
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
                  className={`chip ${selected ? "selected" : ""}`}
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
          className="submit"
          disabled={loading}
        >
          선수 찾기
        </button>
      </form>

      {/* 결과 */}
      {loading && <div className="hint">불러오는 중…</div>}
      {error && <div className="hint error">{error}</div>}

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
            className="chip-result"
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

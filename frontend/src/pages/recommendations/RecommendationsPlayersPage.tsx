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
  const [showPopup, setShowPopup] = useState(false); // 팝업 표시 여부
  const [currentRecommendedPlayerIndex, setCurrentRecommendedPlayerIndex] = useState(0); // 현재 팝업에 표시될 선수의 인덱스

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
      if (Array.isArray(list) && list.length > 0) {
        setCurrentRecommendedPlayerIndex(0); // 첫 번째 선수부터 시작
        setShowPopup(true); // 팝업 열기
      }
    } catch (err: any) {
      console.error("Error fetching recommendations:", err);
      setError(err?.message || "추천 요청 실패");
    } finally {
      setLoading(false);
    }
  };

  const currentRecommendedPlayer = results[currentRecommendedPlayerIndex]; // 현재 팝업에 표시될 선수

  const closePopup = () => {
    setShowPopup(false);
    setCurrentRecommendedPlayerIndex(0); // 팝업 닫을 때 인덱스 초기화
  };

  const showNextPlayer = () => {
    if (currentRecommendedPlayerIndex < results.length - 1) {
      setCurrentRecommendedPlayerIndex((prevIndex) => prevIndex + 1);
    } else {
      // 마지막 선수이면 팝업 닫기
      closePopup();
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
          <div className="field-group row gap grid-3">
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

      {/* 기존 결과 목록 대신 팝업을 조건부 렌더링 */}
      {showPopup && currentRecommendedPlayer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>추천 선수</h3>
            <p><span>이름:</span> {currentRecommendedPlayer.user.name}</p>
            <p><span>포지션:</span> {currentRecommendedPlayer.user.positions.join(', ')}</p>
            <p><span>플레이 스타일:</span> {currentRecommendedPlayer.user.playStyles.join(', ')}</p>
            <p><span>자신있는 능력:</span> {currentRecommendedPlayer.user.skills.join(', ')}</p>
            <p><span>지역:</span> {currentRecommendedPlayer.user.area}</p>
            <p><span>점수:</span> {currentRecommendedPlayer.score}점</p>
            <div className="button-group">
              <button onClick={closePopup}>닫기</button>
              {currentRecommendedPlayerIndex < results.length - 1 ? (
                <button onClick={showNextPlayer}>다음</button>
              ) : (
                <button onClick={closePopup}>마지막 선수</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 기존 결과 목록은 이제 더 이상 렌더링하지 않습니다. */}
      {/* 
      {!showPopup && (
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
              key={r.user.id || idx}
              onClick={() => navigate(`/recommendations/players/${idx}`)}
              className="chip-result"
            >
              <div>Name: {r.user.name}</div>
              <div>Position: {r.user.positions.join(', ')}</div>
              <div>Play Style: {r.user.playStyles.join(', ')}</div>
              <div>Skills: {r.user.skills.join(', ')}</div>
              <div>Region: {r.user.area}</div>
              <div>Score: {r.score}</div>
            </li>
          ))}
        </ul>
      )}
      */}
    </div>
  );
}

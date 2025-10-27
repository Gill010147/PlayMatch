import React, { useEffect, useState } from "react";
import { RecommendationsService, ChatService } from "../../services/api";
import { POSITION_OPTIONS, PLAYSTYLE_OPTIONS, SKILL_OPTIONS } from "../../constants/playerOptions"; 
import { useNavigate } from "react-router-dom";
import "../SignupPage.css"; // SignupPage.css import
import "./RecommendedPlayerCard.css"; // RecommendedPlayerCard.css import

// RecommendedPlayerDto와 일치하는 타입 정의
interface RecommendedPlayer {
  id: number;
  name: string;
  position: string;
  playStyles: string[];
  skills: string[];
  area: string;
  score: number;
}

// 카카오 주소검색 타입 선언
declare global {
  interface Window {
    daum: any;
  }
}

export default function RecommendationsPlayersPage() {
  const [criteria, setCriteria] = useState<{
    position?: string;
    playStyles: string[];
    skills: string[];
    area?: string;
  }>({
    playStyles: [],
    skills: [],
  });
  const [results, setResults] = useState<RecommendedPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contactingId, setContactingId] = useState<number | null>(null); // 연락하기 로딩 상태
  const [currentIndex, setCurrentIndex] = useState(0); // 캐러셀 현재 인덱스

  useEffect(() => {
    console.log("RecommendationsPlayersPage - VITE_USE_MOCKS:", import.meta.env.VITE_USE_MOCKS);
  }, []);

  const navigate = useNavigate();

  const toggleValue = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const handleContact = async (userId: number) => {
    if (contactingId === userId) return; // 이미 처리 중인 경우 중복 방지
    setContactingId(userId);
    try {
      // ChatService에 해당 유저와의 1:1 채팅방 생성/조회 요청
      const room: any = await ChatService.createOrGetRoom(String(userId));
      if (room && room.id) {
        navigate(`/chat/rooms/${room.id}`);
      } else {
        throw new Error("채팅방 정보를 가져오지 못했습니다.");
      }
    } catch (err: any) {
      console.error("연락하기 실패:", err);
      alert(err.message || "채팅방을 열 수 없습니다.");
    } finally {
      setContactingId(null);
    }
  };

  const openPostcode = () => {
    new window.daum.Postcode({
      oncomplete: (data: any) => {
        setCriteria((c) => ({ ...c, area: data.address }));
      },
    }).open();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCurrentIndex(0); // 검색 시 첫 번째 카드로 리셋
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

  const showNext = () => {
    setCurrentIndex(prev => (prev + 1) % results.length);
  };

  const showPrev = () => {
    setCurrentIndex(prev => (prev - 1 + results.length) % results.length);
  };

  const currentResult = results[currentIndex];

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
            {POSITION_OPTIONS.map((opt) => {
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

        {/* 지역 */}
        <div className="field">
          <span className="label">지역</span>
          <div className="field-group row gap">
            <span>{criteria.area || "주소를 검색해주세요."}</span>
            <button type="button" onClick={openPostcode} className="button-sm">
              주소 검색
            </button>
          </div>
        </div>

        {/* 플레이 스타일 */}
        <div className="field">
          <span className="label">플레이 스타일</span>
          <div className="field-group row gap grid-4">
            {PLAYSTYLE_OPTIONS.map((opt) => {
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
            {SKILL_OPTIONS.map((opt) => {
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

      {results.length > 0 && currentResult && (
        <div className="carousel-container">
          <div key={currentResult.id} className="player-card">
            <div className="card-header">
              <span className="player-name">{currentResult.name}</span>
              <span className="player-score">매칭 {currentResult.score}점</span>
            </div>
            <div className="card-body">
              <div className="info-row"><strong>포지션:</strong> {currentResult.position}</div>
              <div className="info-row"><strong>지역:</strong> {currentResult.area}</div>
              <div className="info-row">
                <strong>플레이스타일:</strong>
                <div className="skills-container">
                  {currentResult.playStyles.map(style => <span key={style} className="skill-chip">{style}</span>)}
                </div>
              </div>
              <div className="info-row">
                <strong>자신있는 능력:</strong>
                <div className="skills-container">
                  {currentResult.skills.map(skill => <span key={skill} className="skill-chip">{skill}</span>)}
                </div>
              </div>
            </div>
            <div className="card-footer">
              <button 
                className="contact-button" 
                onClick={() => handleContact(currentResult.id)}
                disabled={contactingId === currentResult.id}
              >
                {contactingId === currentResult.id ? '연락 중...' : '연락하기'}
              </button>
            </div>
          </div>

          <div className="carousel-navigation">
            <button className="nav-button" onClick={showPrev}>‹</button>
            <span className="carousel-counter">{currentIndex + 1} / {results.length}</span>
            <button className="nav-button" onClick={showNext}>›</button>
          </div>
        </div>
      )}
    </div>
  );
}

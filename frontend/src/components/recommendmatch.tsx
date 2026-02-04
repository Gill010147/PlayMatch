import React, { useState, useEffect } from "react";
import "./recommendmatch.css";
import { useNavigate } from "react-router-dom";
import { ChatService } from "../services/api"; // ChatService 임포트
import { AuthService } from "../services/api"; // AuthService 임포트

// 백엔드의 MatchResponseDto와 일치하는 인터페이스
interface Match {
  id: number;
  title: string;
  hostTeamName: string;
  hostUserId: number; // 주최자 ID 추가
  matchDate: string;
  locationName: string;
  status: string;
  memberCount: number;
  maxMemberCount: number;
}

interface RecommendedMatchListProps {
  matches?: Match[];
}

const RecommendedMatchList: React.FC<RecommendedMatchListProps> = ({ matches = [] }) => {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await AuthService.me();
        setCurrentUserId(parseInt(user.id, 10));
      } catch (error) {
        console.error("현재 사용자 정보 로드 실패:", error);
        setCurrentUserId(null); // 에러 발생 시 ID 초기화
      }
    };
    fetchCurrentUser();
  }, []);

  // 경기 아이템 클릭 시 상세 페이지로 이동
  const handleItemClick = (matchId: number) => {
    navigate(`/matches/${matchId}`);
  };

  // '연락하기' 버튼 클릭 시 채팅방 생성/이동
  const handleContactHost = async (e: React.MouseEvent, hostUserId: number) => {
    e.stopPropagation(); // 부모 요소(li)의 클릭 이벤트 전파 방지
    if (currentUserId === hostUserId) {
      alert("자신에게는 연락할 수 없습니다.");
      return;
    }
    try {
      // 1:1 채팅방 생성 또는 조회 API 호출
      const room = await ChatService.createOrGetRoom(String(hostUserId));
      // 채팅방으로 이동하면서 state에 방 정보를 전달
      navigate(`/chat/rooms/${room.id}`, { state: { room } });
    } catch (error) {
      console.error("채팅방 생성/이동 실패:", error);
      alert("채팅방을 열 수 없습니다.");
    }
  };

  return (
    <section className="recommended-matches">
      <h2>추천 Match</h2>
      <ul>
        {matches.length === 0 ? (
          <li className="no-matches">추천 매치가 없습니다.</li>
        ) : (
          matches.map((match) => (
            <li
              key={match.id}
              className={`match-item ${match.status !== "RECRUITING" ? "closed" : "open"}`}
              onClick={() => handleItemClick(match.id)}
            >
              <span className="match-time">{new Date(match.matchDate).toLocaleDateString()}</span>
              <span className="match-location">{match.locationName}</span>
              <span className="match-detail">
                {match.title}
              </span>
              <button
                onClick={(e) => handleContactHost(e, match.hostUserId)}
                disabled={currentUserId === match.hostUserId} // 자신이 주최자인 경우 버튼 비활성화
                style={{ opacity: currentUserId === match.hostUserId ? 0.5 : 1, cursor: currentUserId === match.hostUserId ? 'not-allowed' : 'pointer' }}
              >
                주최자에게 연락
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  );
};

export default RecommendedMatchList;

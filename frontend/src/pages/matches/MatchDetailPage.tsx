import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MatchesService, AuthService, ChatService } from "../../services/api";
import type { MatchResponseDto } from "../../types/domain"; // MatchDetail 대신 MatchResponseDto 사용

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

export default function MatchDetailPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<MatchResponseDto | null>(null); // MatchDetail 대신 MatchResponseDto 사용
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applyLoading, setApplyLoading] = useState(false);
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

  const handleContactHost = async () => {
    if (!data || !currentUserId) return;
    if (currentUserId === data.hostUserId) {
      alert("자신에게는 연락할 수 없습니다.");
      return;
    }
    try {
      const room = await ChatService.createOrGetRoom(String(data.hostUserId));
      navigate(`/chat/rooms/${room.id}`, { state: { room } });
    } catch (error) {
      console.error("채팅방 생성/이동 실패:", error);
      alert("채팅방을 열 수 없습니다.");
    }
  };

  if (loading) return <div style={{ padding: 16 }}>불러오는 중…</div>;
  if (error) return <div style={{ padding: 16, color: "crimson" }}>{error}</div>;
  if (!data) return <div style={{ padding: 16 }}>데이터가 없습니다.</div>;

  const isHost = currentUserId === data.hostUserId;

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px", display: "grid", gap: 12 }}>
      <h2>경기 상세</h2>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{
          backgroundColor: getMatchStatusColor(data.status),
          color: "#fff",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "12px",
          fontWeight: "600",
        }}>{getMatchStatusText(data.status)}</span>
        <div style={{ fontWeight: 600, fontSize: "18px" }}>{data.title}</div>
      </div>
      <div style={{ color: "#666" }}>{new Date(data.matchDate).toLocaleString()} • {data.locationName}</div>
      <div style={{ color: "#666" }}>주최팀: {data.hostTeamName}</div>
      <div style={{ color: "#666" }}>인원: {data.memberCount} / {data.maxMemberCount}</div>
      {data.description && <p style={{ lineHeight: "1.6", color: "#333" }}>{data.description}</p>}
      
      <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
        {data.status === 'RECRUITING' && !isHost && (
          <></> // 용병 신청 버튼 제거
        )}
        {!isHost && (
          <button onClick={handleContactHost} style={{
            padding: "10px 16px",
            backgroundColor: "#2196F3",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "500",
          }}>
            주최자에게 연락
          </button>
        )}
        {isHost && (
          <button disabled style={{
            padding: "10px 16px",
            backgroundColor: "#9E9E9E",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "not-allowed",
            fontSize: "16px",
            fontWeight: "500",
          }}>
            내가 주최한 경기
          </button>
        )}
      </div>
    </div>
  );
}





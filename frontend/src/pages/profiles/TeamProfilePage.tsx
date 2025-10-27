import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProfilesService } from "../../services/api";
import type { TeamProfile } from "../../types/domain";
import "./TeamProfilePage.css"; // Import the new CSS file

export default function TeamProfilePage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<TeamProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) return;
    let mounted = true;
    setLoading(true);
    ProfilesService.getTeam(teamId)
      .then((d: any) => { if (mounted) setData(d || null); })
      .catch((e) => { if (mounted) setError(e?.message || "불러오지 못했습니다."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [teamId]);

  if (loading) return <div className="loading-error-container">불러오는 중…</div>;
  if (error) return <div className="loading-error-container error-text">{error}</div>;
  if (!data) return <div className="loading-error-container">데이터가 없습니다.</div>;

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const fullLogoUrl = data.teamLogo && data.teamLogo.startsWith('/')
      ? `${apiBaseUrl}${data.teamLogo}`
      : data.teamLogo;

  return (
    <div className="team-profile-container">
      <header className="team-profile-header">
        {fullLogoUrl && (
          <img src={fullLogoUrl} alt={`${data.name} 팀 로고`} className="team-logo" />
        )}
        <h2 className="team-name">{data.name}</h2>
      </header>

      <div className="team-profile-body">
        <div className="profile-section">
          <h3>주요 활동 지역</h3>
          <p>{data.mainArea || "미지정"}</p>
        </div>

        <div className="profile-section">
          <h3>최대 인원</h3>
          <p>{data.maxMembers ?? 0} 명</p>
        </div>

        <div className="profile-section">
          <h3>팀 소개</h3>
          <p>{data.introduce || "소개글이 없습니다."}</p>
        </div>
      </div>

      <button className="edit-button" onClick={() => navigate(`/profiles/teams/${data.id}/edit`)}>
        팀 프로필 수정
      </button>
    </div>
  );
}














import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProfilesService, ApiError } from "../../services/api";
import type { TeamProfile } from "../../types/domain";
import "./EditTeamProfilePage.css"; // Import the new CSS file

export default function EditTeamProfilePage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Partial<TeamProfile>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) return;
    let mounted = true;
    ProfilesService.getTeam(teamId)
      .then((d: any) => { if (mounted) setForm(d || {}); })
      .catch(() => {});
    return () => { mounted = false; };
  }, [teamId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId) return;
    setSaving(true);
    setError(null);
    try {
      await ProfilesService.updateTeam(teamId, form);
      alert("팀 정보가 성공적으로 수정되었습니다.");
      navigate(`/profiles/teams/${teamId}`); // Navigate back to the profile page
    } catch (err: any) {
      setError(err?.message || "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const fullLogoUrl = form.teamLogo && form.teamLogo.startsWith('/')
      ? `${apiBaseUrl}${form.teamLogo}`
      : form.teamLogo;

  return (
    <div className="edit-team-profile-container">
      <h2>팀 프로필 수정</h2>

      {fullLogoUrl && (
          <img src={fullLogoUrl} alt={`${form.name} 팀 로고`} className="team-logo-preview" />
      )}

      <form onSubmit={handleSave} className="edit-team-form">
        <div className="form-group">
          <label htmlFor="teamName">팀명</label>
          <input id="teamName" placeholder="팀명" value={form.name || ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>

        <div className="form-group">
          <label htmlFor="mainArea">활동 지역</label>
          <input id="mainArea" placeholder="주요 활동 지역" value={form.mainArea || ""} onChange={(e) => setForm((f) => ({ ...f, mainArea: e.target.value }))} />
        </div>

        <div className="form-group">
          <label htmlFor="introduce">팀 소개</label>
          <textarea id="introduce" placeholder="팀에 대해 소개해주세요" value={form.introduce || ""} onChange={(e) => setForm((f) => ({ ...f, introduce: e.target.value }))} />
        </div>

        <div className="form-group">
          <label htmlFor="maxMembers">최대 인원</label>
          <input id="maxMembers" type="number" placeholder="최대 인원" value={form.maxMembers || 0} onChange={(e) => setForm((f) => ({ ...f, maxMembers: Number(e.target.value) }))} />
        </div>

        <button type="submit" className="save-button" disabled={saving}>
          {saving ? "저장 중…" : "저장"}
        </button>

        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
}

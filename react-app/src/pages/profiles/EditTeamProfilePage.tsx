import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ProfilesService } from "../../services/api";
import type { TeamProfile } from "../../types/domain";

export default function EditTeamProfilePage() {
  const { teamId } = useParams<{ teamId: string }>();
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
      alert("저장 완료 (데모)");
    } catch (err: any) {
      setError(err?.message || "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px" }}>
      <h2>팀 프로필 수정</h2>
      <form onSubmit={handleSave} style={{ display: "grid", gap: 12 }}>
        <input placeholder="팀명" value={form.name || ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <input placeholder="지역" value={form.region || ""} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} />
        <textarea placeholder="소개" value={form.description || ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        <button type="submit" disabled={saving}>{saving ? "저장 중…" : "저장"}</button>
        {error && <div style={{ color: "crimson" }}>{error}</div>}
      </form>
    </div>
  );
}






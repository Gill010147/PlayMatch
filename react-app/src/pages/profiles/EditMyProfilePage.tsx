import React, { useEffect, useState } from "react";
import { ProfilesService } from "../../services/api";
import type { UserProfile } from "../../types/domain";

export default function EditMyProfilePage() {
  const [form, setForm] = useState<Partial<UserProfile>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Optionally prefill from localStorage for demo
    try {
      const raw = localStorage.getItem("userProfile");
      if (raw) setForm(JSON.parse(raw));
    } catch {}
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await ProfilesService.updateMe(form);
      alert("저장 완료 (데모)");
    } catch (err: any) {
      setError(err?.message || "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px" }}>
      <h2>내 프로필 수정</h2>
      <form onSubmit={handleSave} style={{ display: "grid", gap: 12 }}>
        <input placeholder="이름" value={form.name || ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <input placeholder="도시" value={form.region?.city || ""} onChange={(e) => setForm((f) => ({ ...f, region: { ...(f.region || {}), city: e.target.value } }))} />
        <input placeholder="구/군" value={form.region?.district || ""} onChange={(e) => setForm((f) => ({ ...f, region: { ...(f.region || {}), district: e.target.value } }))} />
        <button type="submit" disabled={saving}>{saving ? "저장 중…" : "저장"}</button>
        {error && <div style={{ color: "crimson" }}>{error}</div>}
      </form>
    </div>
  );
}






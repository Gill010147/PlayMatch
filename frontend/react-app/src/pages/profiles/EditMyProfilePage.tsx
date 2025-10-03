import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProfilesService } from "../../services/api";
import type { UserProfile } from "../../types/domain";

export default function EditMyProfilePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<Partial<UserProfile> & { age?: number }>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [birthYear, setBirthYear] = useState<string>("");
  const [birthMonth, setBirthMonth] = useState<string>("");
  const [birthDay, setBirthDay] = useState<string>("");

  const POSITION_OPTIONS = ["공격수", "미드필더", "수비수", "골키퍼"];
  const PLAYSTYLE_OPTIONS = ["공격", "밸런스", "수비"];
  const SKILL_OPTIONS = ["슈팅", "패스", "드리블", "스피드", "골키핑"];

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    const arr: number[] = [];
    for (let y = now; y >= 1940; y--) arr.push(y);
    return arr;
  }, []);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = useMemo(() => {
    const y = Number(birthYear) || 2000;
    const m = Number(birthMonth) || 1;
    const last = new Date(y, m, 0).getDate();
    return Array.from({ length: last }, (_, i) => i + 1);
  }, [birthYear, birthMonth]);

  // 초기값 세팅 (localStorage → 추후 서버 값으로 교체 가능)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("userProfile");
      if (raw) setForm(JSON.parse(raw));
    } catch {}
  }, []);

  // 나이 계산
  useEffect(() => {
    if (birthYear && birthMonth && birthDay) {
      const by = Number(birthYear);
      const bm = Number(birthMonth);
      const bd = Number(birthDay);
      const today = new Date();
      let age = today.getFullYear() - by;
      if (
        today.getMonth() + 1 < bm ||
        (today.getMonth() + 1 === bm && today.getDate() < bd)
      ) {
        age -= 1;
      }
      setForm((f) => ({ ...f, age }));
    }
  }, [birthYear, birthMonth, birthDay]);

  const toggleChip = (key: "positions" | "playStyles" | "skills", value: string) => {
    setForm((f) => {
      const current = new Set<string>(Array.isArray(f[key]) ? (f[key] as string[]) : []);
      if (current.has(value)) current.delete(value); else current.add(value);
      return { ...f, [key]: Array.from(current) } as any;
    });
  };

  const openAddressSearch = () => {
    try {
      const anyWindow = window as any;
      if (anyWindow?.daum?.Postcode) {
        new anyWindow.daum.Postcode({
          oncomplete: (data: any) => {
            const full = data.address || data.roadAddress || data.jibunAddress || "";
            const city = data.sido || "";
            const district = data.sigungu || "";
            setForm((f) => ({
              ...f,
              region: { ...(f.region || {}), city, district, fullAddress: full },
            }));
          },
        }).open();
        return;
      }
    } catch {}
    alert("주소 검색 스크립트가 준비되지 않았습니다. 수동 입력을 사용해주세요.");
  };

  // 저장 버튼 → API 호출
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      localStorage.setItem("userProfile", JSON.stringify(form)); // 프론트에서도 보관
      await ProfilesService.updateMe(form); // 서버 업데이트
      alert("저장 완료");
      navigate("/mypage");
    } catch (err: any) {
      setError(err?.message || "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px" }}>
      <h2 style={{ marginBottom: 16 }}>내 프로필 수정</h2>
      <form onSubmit={handleSave} style={{ display: "grid", gap: 16 }}>
        {/* 이름 */}
        <label style={{ display: "grid", gap: 6 }}>
          <span>이름</span>
          <input
            value={form.name || ""}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="이름을 입력하세요"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          />
        </label>

        {/* 지역 */}
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>지역</span>
            <button type="button" onClick={openAddressSearch}>주소 검색</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input
              placeholder="도시"
              value={form.region?.city || ""}
              onChange={(e) => setForm((f) => ({ ...f, region: { ...(f.region || {}), city: e.target.value } }))}
            />
            <input
              placeholder="구/군"
              value={form.region?.district || ""}
              onChange={(e) => setForm((f) => ({ ...f, region: { ...(f.region || {}), district: e.target.value } }))}
            />
          </div>
        </div>

        {/* 생년월일 */}
        <div style={{ display: "grid", gap: 8 }}>
          <span>생년월일</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <select value={birthYear} onChange={(e) => setBirthYear(e.target.value)}>
              <option value="">년도</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)}>
              <option value="">월</option>
              {months.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)}>
              <option value="">일</option>
              {days.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>나이: {form.age ? `${form.age}세` : "미설정"}</div>
        </div>

        {/* 포지션 */}
        <div>
          <span>포지션</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {POSITION_OPTIONS.map((opt) => {
              const selected = (form.positions || []).includes(opt);
              return (
                <button key={opt} type="button" onClick={() => toggleChip("positions", opt)}>
                  {selected ? `✅ ${opt}` : opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* 플레이 스타일 */}
        <div>
          <span>플레이 스타일</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {PLAYSTYLE_OPTIONS.map((opt) => {
              const selected = (form.playStyles || []).includes(opt);
              return (
                <button key={opt} type="button" onClick={() => toggleChip("playStyles", opt)}>
                  {selected ? `✅ ${opt}` : opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* 자신있는 능력 */}
        <div>
          <span>자신있는 능력</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SKILL_OPTIONS.map((opt) => {
              const selected = (form.skills || []).includes(opt);
              return (
                <button key={opt} type="button" onClick={() => toggleChip("skills", opt)}>
                  {selected ? `✅ ${opt}` : opt}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <button type="submit" disabled={saving}>
            {saving ? "저장 중…" : "저장"}
          </button>
        </div>
        {error && <div style={{ color: "red" }}>{error}</div>}
      </form>
    </div>
  );
}

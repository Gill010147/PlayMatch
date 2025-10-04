import React, { useState } from "react";
import logo from "../logo.png";
import { useNavigate } from "react-router-dom";
import { MatchesService } from "../services/api";

declare global {
  interface Window {
    daum: any;
  }
}

export default function CreateMatchPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState<string>("60");
  const [type, setType] = useState("실내");
  const [teamFormat, setTeamFormat] = useState("5vs5");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    try {
      setSaving(true);
      // 간단 검증
      if (!title || !date || !time || !location) {
        alert("필수 항목을 모두 입력해주세요.");
        return;
      }
      const teams = `남녀모두 - ${teamFormat}`;
      const datetime = `${date} ${time}`;
      await MatchesService.create({
        time: datetime,
        location,
        type,
        teams,
        status: "open",
        title,
        date,
        duration,
      });
      alert("경기가 생성되었습니다.");
      navigate("/");
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || (typeof err === "string" ? err : JSON.stringify(err));
      alert(`경기 생성 중 오류가 발생했습니다.\n${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const openAddressSearch = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert("주소 검색 스크립트가 로드되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    new window.daum.Postcode({
      oncomplete: (data: any) => {
        const addr = data.roadAddress || data.jibunAddress || data.address || "";
        if (addr) setLocation(addr);
      },
    }).open();
  };

  return (
    <>
      <header
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "30px",
        }}
      >
        <img
          src={logo}
          alt="Play Match Logo"
          style={{ height: "72px", cursor: "pointer" }}
          onClick={() => navigate("/")}
        />
      </header>
      <div style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px" }}>
        <h2 style={{ marginBottom: 16 }}>경기 생성</h2>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>제목</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 주말 풋살 친선전"
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
              required
            />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>일자</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
                required
              />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>시간</span>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
                required
              />
            </label>
          </div>

          <label style={{ display: "grid", gap: 6 }}>
            <span>진행 시간(분)</span>
            <input
              type="number"
              min={10}
              step={10}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="예: 60"
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
              required
            />
          </label>

          <div style={{ display: "grid", gap: 6 }}>
            <span>장소 (주소 검색)</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="주소를 검색하세요"
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
                required
              />
              <button type="button" onClick={openAddressSearch} style={{ padding: "10px 12px" }}>주소검색</button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>유형</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
              >
                <option value="실내">실내</option>
                <option value="야외">야외</option>
              </select>
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span>팀 구성</span>
              <select
                value={teamFormat}
                onChange={(e) => setTeamFormat(e.target.value)}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
              >
                <option value="5vs5">5vs5</option>
                <option value="6vs6">6vs6</option>
                <option value="7vs7">7vs7</option>
              </select>
            </label>
          </div>

          <button
            type="submit"
            style={{
              marginTop: 8,
              padding: "12px 18px",
              backgroundColor: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: 600,
            }}
            disabled={saving}
          >
            {saving ? "생성 중…" : "생성하기"}
          </button>
        </form>
      </div>
    </>
  );
}



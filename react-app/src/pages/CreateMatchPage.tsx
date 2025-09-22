import React, { useState } from "react";
import logo from "../logo.png";

export default function CreateMatchPage() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("실내");
  const [teamFormat, setTeamFormat] = useState("5vs5");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit logic (API integration)
    alert("경기가 생성되었습니다. (데모)");
    window.history.back();
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
        <img src={logo} alt="Play Match Logo" style={{ height: "72px" }} />
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
            <span>장소</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="주소 또는 구장명"
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
              required
            />
          </label>

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
              backgroundColor: "rgba(70, 55, 238, 1)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            생성하기
          </button>
        </form>
      </div>
    </>
  );
}



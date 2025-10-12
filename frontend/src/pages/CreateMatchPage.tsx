import React, { useState, useEffect } from "react";
import logo from "../logo.png";
import { useNavigate } from "react-router-dom";
import { MatchesService, TeamsService } from "../services/api";
import { useMatches } from '../contexts/MatchesContext';
import type { Team } from "../types/domain";

declare global {
  interface Window {
    daum: any;
  }
}

export default function CreateMatchPage() {
  const navigate = useNavigate();
  const { fetchMatches } = useMatches();

  // Team State
  const [hostTeamId, setHostTeamId] = useState<number | null>(null);
  const [teamsLoaded, setTeamsLoaded] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [locationName, setLocationName] = useState("");
  const [description, setDescription] = useState("");
  const [matchType, setMatchType] = useState("FUTSAL_5V5");
  const [venueType, setVenueType] = useState("INDOOR");
  const [maxMemberCount, setMaxMemberCount] = useState(10);

  const [saving, setSaving] = useState(false);

  // Fetch user's team
  useEffect(() => {
    const fetchMyTeam = async () => {
      try {
        const myTeams: Team[] = await TeamsService.myTeams();
        if (myTeams && myTeams.length > 0) {
          // Assume the user uses their first team to create a match
          setHostTeamId(myTeams[0].id);
        }
      } catch (error) {
        console.error("팀 정보를 가져오는데 실패했습니다:", error);
      } finally {
        setTeamsLoaded(true);
      }
    };

    fetchMyTeam();
  }, []);


  // '경기 종류'가 변경될 때 '최대 인원 수' 자동 업데이트
  useEffect(() => {
    let count = 10;
    if (matchType === 'FUTSAL_6V6') {
      count = 12;
    } else if (matchType === 'SOCCER_11V11') {
      count = 22;
    }
    setMaxMemberCount(count);
  }, [matchType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    if (!hostTeamId) {
      alert("경기를 생성하려면 먼저 팀에 소속되어 있어야 합니다.");
      return;
    }

    if (!title || !date || !time || !locationName || !maxMemberCount) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title,
        description,
        hostTeamId, // Use the fetched team ID
        matchDate: `${date}T${time}:00`,
        locationName,
        latitude: 37.5665,  // 임시 하드코딩 (서울 시청)
        longitude: 126.9780, // 임시 하드코딩 (서울 시청)
        matchType,
        venueType,
        maxMemberCount,
      };

      await MatchesService.create(payload);

      alert("경기가 생성되었습니다.");
      fetchMatches();
      navigate("/");
    } catch (err: any) {
      console.error("경기 생성 실패:", err);
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
        if (addr) setLocationName(addr);
      },
    }).open();
  };

  // Render a loading state or disabled form while checking for a team
  if (!teamsLoaded) {
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
        <div style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px", textAlign: "center" }}>
            <h2 style={{ marginBottom: 16 }}>경기 생성</h2>
            <p>사용자 팀 정보를 불러오는 중입니다...</p>
        </div>
      </>
    );
  }

  if (!hostTeamId) {
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
        <div style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px", textAlign: "center" }}>
            <h2 style={{ marginBottom: 16 }}>경기 생성 불가</h2>
            <p style={{ marginBottom: 24 }}>경기를 생성하려면 먼저 팀을 생성하거나 팀에 가입해야 합니다.</p>
            <button 
              onClick={() => navigate('/profiles/teams/create')} 
              style={{
                padding: "12px 18px",
                backgroundColor: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              팀 생성하기
            </button>
        </div>
      </>
    );
  }


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
          {/* Form fields remain the same */}
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

          <div style={{ display: "grid", gap: 6 }}>
            <span>장소 (주소 검색)</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
              <input
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="주소를 검색하세요"
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
                required
              />
              <button type="button" onClick={openAddressSearch} style={{ padding: "10px 12px" }}>주소검색</button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>경기 종류</span>
              <select
                value={matchType}
                onChange={(e) => setMatchType(e.target.value)}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
              >
                <option value="FUTSAL_5V5">풋살 5vs5</option>
                <option value="FUTSAL_6V6">풋살 6vs6</option>
                <option value="SOCCER_11V11">축구 11vs11</option>
              </select>
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>장소 유형</span>
              <select
                value={venueType}
                onChange={(e) => setVenueType(e.target.value)}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
              >
                <option value="INDOOR">실내</option>
                <option value="OUTDOOR">야외</option>
              </select>
            </label>
          </div>

          <label style={{ display: "grid", gap: 6 }}>
            <span>최대 인원 수</span>
            <input
              type="number"
              min={2}
              step={1}
              value={maxMemberCount}
              onChange={(e) => setMaxMemberCount(Number(e.target.value))}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
              required
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>설명</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="경기 관련 추가 정보를 입력하세요. (예: 실력, 준비물 등)"
              rows={4}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd", resize: "vertical" }}
            />
          </label>

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

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./MyPage.css";
import logoImg from "../logo.png";

export default function MyPage() {
  const [name, setName] = useState<string>("홍길동");
  const [positions, setPositions] = useState<string[]>([]);
  const [playStyles, setPlayStyles] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [region, setRegion] = useState<{ city?: string; district?: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("userProfile");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.name) setName(parsed.name);
      if (Array.isArray(parsed.positions)) setPositions(parsed.positions);
      if (Array.isArray(parsed.playStyles)) setPlayStyles(parsed.playStyles);
      if (Array.isArray(parsed.skills)) setSkills(parsed.skills);
      if (parsed.region) setRegion({ city: parsed.region.city, district: parsed.region.district });
    } catch {}
  }, []);

  return (
    <div className="mypage-wrap">
      <div className="mypage-top">
        <Link to="/" aria-label="메인으로 이동">
          <img src={logoImg} alt="Play Match Logo" className="mypage-logo" />
        </Link>
      </div>
      <header className="mypage-header">
        <div className="profile-left">
          <div className="user-name">{name}</div>
          <div className="stars" aria-label="평점">
            <span>★</span>
            <span>★</span>
            <span>★</span>
            <span>★</span>
            <span>★</span>
          </div>
          <div className="tags-row">
            {positions.length > 0 ? (
              positions.map(p => (
                <span key={p} className="tag">{p}</span>
              ))
            ) : (
              <span className="tag">포지션 미선택</span>
            )}
          </div>
          <div className="meta-row">
            <span className="pill">{region ? `${region.city || ''} ${region.district || ''}`.trim() : '지역 미설정'}</span>
            <span className="pill">20대</span>
          </div>
        </div>
        <div className="profile-right">
          <div className="avatar" aria-label="프로필 이미지" />
          <button className="team-btn">팀 등록하기</button>
        </div>
      </header>

      <section className="card">
        <div className="card-header">
          <span>나의 플레이 스타일은?</span>
          <span className="chev">›</span>
        </div>
        <div className="chip-row">
          {playStyles.length > 0 ? (
            playStyles.map(s => (
              <span key={s} className="chip">{s}</span>
            ))
          ) : (
            <span className="chip">미선택</span>
          )}
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <span>나의 강점은?</span>
          <span className="chev">›</span>
        </div>
        <div className="chip-row">
          {skills.length > 0 ? (
            skills.map(s => (
              <span key={s} className="chip">{s}</span>
            ))
          ) : (
            <span className="chip">미선택</span>
          )}
        </div>
      </section>

      <div className="footer-action">
        {/* <button className="save-btn">변경 완료</button> */}
      </div>
    </div>
  );
}

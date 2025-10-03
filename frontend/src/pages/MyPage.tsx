import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./MyPage.css";
import logoImg from "../logo.png";

export default function MyPage() {
  const [name, setName] = useState<string>("");
  const [positions, setPositions] = useState<string[]>([]);
  const [playStyles, setPlayStyles] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [region, setRegion] = useState<{ city?: string; district?: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token"); // 로그인 시 저장했던 토큰
        const response = await axios.get("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = response.data;
        if (data.name) setName(data.name);
        if (Array.isArray(data.positions)) setPositions(data.positions);
        if (Array.isArray(data.playStyles)) setPlayStyles(data.playStyles);
        if (Array.isArray(data.skills)) setSkills(data.skills);
        if (data.region) setRegion({ city: data.region.city, district: data.region.district });
      } catch (error) {
        console.error("내 프로필 조회 실패:", error);
      }
    };

    fetchProfile();
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
          <div className="user-name">{name || "이름 없음"}</div>
          <div className="stars" aria-label="평점">
            <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
          </div>
          <div className="tags-row">
            {positions.length > 0 ? (
              positions.map(p => <span key={p} className="tag">{p}</span>)
            ) : (
              <span className="tag">포지션 미선택</span>
            )}
          </div>
          <div className="meta-row">
            <span className="pill">{region ? `${region.city || ""} ${region.district || ""}`.trim() : "지역 미설정"}</span>
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
            playStyles.map(s => <span key={s} className="chip">{s}</span>)
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
            skills.map(s => <span key={s} className="chip">{s}</span>)
          ) : (
            <span className="chip">미선택</span>
          )}
        </div>
      </section>

		{/* 하단 정보 수정 버튼 */}
		<div style={{ marginTop: 24, padding: "0 16px", display: "flex", justifyContent: "flex-end" }}>
			<Link to="/profiles/users/me/edit">
				<button
					className="edit-profile-btn"
					style={{
						padding: "10px 16px",
						backgroundColor: "rgba(70, 55, 238, 1)",
						color: "#fff",
						border: "none",
						borderRadius: 8,
						cursor: "pointer",
						fontWeight: 600,
					}}
				>
					정보 수정
				</button>
			</Link>
		</div>
    </div>
  );
}

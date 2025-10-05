import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthService, ApiError } from "../services/api";
import "./MyPage.css";
import logoImg from "../logo.png";

export default function MyPage() {
  const navigate = useNavigate();
  const location = useLocation(); // useLocation 훅 사용
  const [name, setName] = useState<string>("");
  const [birthYear, setBirthYear] = useState<string>(""); // age 대신 birthYear 상태 사용
  const [gender, setGender] = useState<string>("");
  const [positions, setPositions] = useState<string[]>([]);
  const [playStyles, setPlayStyles] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [area, setArea] = useState<string>("");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [teamLogoUrl, setTeamLogoUrl] = useState<string | null>(null);

  const currentAge = birthYear ? new Date().getFullYear() - Number(birthYear) + 1 : null; // 만 나이 계산

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Assuming AuthService.me() now returns team info if available
        const profile = await AuthService.me() as any;

        if (profile.name) setName(profile.name);
        if (profile.age) setBirthYear(profile.age); // profile.age를 birthYear로 사용
        if (profile.gender) setGender(profile.gender);
        if (Array.isArray(profile.positions)) setPositions(profile.positions);
        if (Array.isArray(profile.playStyles)) setPlayStyles(profile.playStyles);
        if (Array.isArray(profile.skills)) setSkills(profile.skills);
        if (profile.area) setArea(profile.area);
        
        // Set team info if available
        if (profile.team && profile.team.id) {
          setTeamId(profile.team.id);
          setTeamLogoUrl(profile.team.logoUrl || null);
        } else {
          setTeamId(null);
          setTeamLogoUrl(null);
        }

      } catch (error: any) {
        console.error("내 프로필 조회 실패:", error);
        alert("프로필 조회 실패: " + (error.message || "알 수 없는 오류"));
      }
    };

    fetchProfile();
  }, [location.state]); // location.state를 의존성 배열에 추가

  return (
    <div className="mypage-wrap" style={{ backgroundColor: "#f9f9f9", minHeight: "100vh" }}> {/* 배경색 추가 */}
      <div className="mypage-top">
        <Link to="/">
          <img src={logoImg} alt="Play Match Logo" className="mypage-logo" />
        </Link>
      </div>
      <h2 style={{ textAlign: "center", margin: "24px 0", color: "#333" }}>내 프로필</h2> {/* 제목 추가 */}
      <header className="mypage-header">
        <div className="profile-left">
          <div className="user-name">{name || "이름 없음"}</div>
          {/* <div className="stars" aria-label="평점">
            <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
          </div> */}
          <div className="tags-row">
            {positions.length > 0 ? (
              positions.map(p => <span key={p} className="tag">{p}</span>)
            ) : (
              <span className="tag">포지션 미선택</span>
            )}
          </div>
          <div className="meta-row">
            <span className="pill">{area || "지역 미설정"}</span>
            <span className="pill">{currentAge ? `${currentAge}세` : "나이 미설정"}</span> {/* 계산된 나이 표시 */}
            <span className="pill">{gender || "성별 미설정"}</span>
          </div>
        </div>
        <div className="profile-right">
          <div className="avatar" aria-label="프로필 이미지">
            {/* {teamLogoUrl ? (
              <img src={teamLogoUrl} alt="Team Logo" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              // You can keep a placeholder or user avatar here if no team logo
              <img src={logoImg} alt="User Avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            )} */}
          </div>
          {teamId ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="team-btn" onClick={() => navigate(`/profiles/teams/${teamId}`)}>
                팀 프로필 보기
              </button>
              <button className="team-btn" onClick={() => navigate(`/profiles/teams/${teamId}/edit`)}>
                팀 수정
              </button>
            </div>
          ) : (
            <button className="team-btn" onClick={() => navigate("/profiles/teams/create")}>
              팀 등록하기
            </button>
          )}
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

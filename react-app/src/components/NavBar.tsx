import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./NavBar.css";
import logo from "../logo.png"; // 위치에 맞게 수정
import soccerball from './soccerball.webp';
import futsal from './futsal.png';
import team from './team.png';
import feedback from './feedback.png';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const updateAuthState = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };
    // 초기 상태 동기화
    updateAuthState();
    // 커스텀 이벤트 및 storage 이벤트 수신
    const onAuthChanged = () => updateAuthState();
    window.addEventListener("auth:changed", onAuthChanged as EventListener);
    window.addEventListener("storage", onAuthChanged as EventListener);
    return () => {
      window.removeEventListener("auth:changed", onAuthChanged as EventListener);
      window.removeEventListener("storage", onAuthChanged as EventListener);
    };
  }, []);

  // 로그아웃 API 호출
  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout"); // 백엔드 세션/토큰 무효화 요청
    } catch (error) {
      console.error("서버 로그아웃 실패:", error);
      // 서버 에러가 나더라도 클라이언트 쪽에서는 토큰 제거
    } finally {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("auth:changed"));
      navigate("/login"); // 로그아웃 후 로그인 페이지로 이동
    }
  };

  return (
    <header
      className="navbar"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "30px",
      }}
    >
      {/* 로고 */}
      <img
        src={logo}
        alt="Play Match Logo"
        style={{ height: "72px", cursor: "pointer" }}
        onClick={() => navigate('/')}
      />

      {/* 로그인/로그아웃 + 아이콘 버튼 */}
      <div
        className="nav-login"
        style={{
          position: "absolute",
          right: "150px",
          top: "10px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {isLoggedIn ? (
          <button
            className="login-text"
            style={{ fontWeight: "500", fontSize: "16px", background: "none", border: "none", cursor: "pointer" }}
            onClick={handleLogout}
          >
            로그아웃
          </button>
        ) : (
          <button
            className="login-text"
            style={{ fontWeight: "500", fontSize: "16px", background: "none", border: "none", cursor: "pointer" }}
            onClick={() => navigate('/login')}
          >
            로그인
          </button>
        )}
        <button className="icon-button" aria-label="마이페이지" onClick={() => navigate('/mypage')}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </div>

      {/* 네비게이션 메뉴 */}
      <nav
        className="nav-center-menu"
        aria-label="Center Menu"
        style={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "center",
          gap: "150px",
        }}
      >
        <button onClick={() => navigate('/matches')} className="nav-link nav-menu-item" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <img src={soccerball} alt="축구 아이콘" className="nav-menu-icon" />
          <div>경기목록</div>
          <div className="nav-menu-eng">Matches</div>
        </button>
        <button onClick={() => navigate('/recommendations/players')} className="nav-link nav-menu-item" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <img src={futsal} alt="풋살 아이콘" className="nav-menu-icon" />
          <div>용병추천</div>
          <div className="nav-menu-eng">Recommend</div>
        </button>
        <button onClick={() => navigate('/chat/rooms')} className="nav-link nav-menu-item" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <img src={team} alt="팀원 아이콘" className="nav-menu-icon" />
          <div>채팅</div>
          <div className="nav-menu-eng">Chat</div>
        </button>
        <button onClick={() => navigate('/feedback')} className="nav-link nav-menu-item" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <img src={feedback} alt="피드백 아이콘" className="nav-menu-icon" />
          <div>피드백</div>
          <div className="nav-menu-eng">Feedback</div>
        </button>
      </nav>
    </header>
  );
};

export default NavBar;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatService } from "../services/api"; // ChatService 임포트
import "./NavBar.css";
import logo from "../logo.png";
import soccerball from './soccerball.webp';
import futsal from './futsal.png';
import team from './team.png';
import feedback from './feedback.png';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // 로그인 상태 감지
  useEffect(() => {
    const updateAuthState = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };
    updateAuthState();
    const onAuthChanged = () => updateAuthState();
    window.addEventListener("auth:changed", onAuthChanged as EventListener);
    window.addEventListener("storage", onAuthChanged as EventListener);
    return () => {
      window.removeEventListener("auth:changed", onAuthChanged as EventListener);
      window.removeEventListener("storage", onAuthChanged as EventListener);
    };
  }, []);

  // 안 읽은 메시지 개수 폴링
  useEffect(() => {
    if (!isLoggedIn) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const data = await ChatService.getUnreadCount();
        setUnreadCount(data.count);
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    fetchUnreadCount(); // 최초 실행
    const intervalId = setInterval(fetchUnreadCount, 15000); // 15초마다 반복

    return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 인터벌 정리
  }, [isLoggedIn]);

  const handleLogout = async () => {
    try {
      // 로그아웃 API 호출은 선택사항 (백엔드에 따라)
      // await ChatService.logout(); 
    } catch (error) {
      console.error("Server logout failed:", error);
    } finally {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("auth:changed"));
      navigate("/login");
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
      <img
        src={logo}
        alt="Play Match Logo"
        style={{ height: "72px", cursor: "pointer" }}
        onClick={() => navigate('/')}
      />

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
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </div>

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
        <button onClick={() => navigate('/chat/rooms')} className="nav-link nav-menu-item" style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}>
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
          <img src={team} alt="팀원 아이콘" className="nav-menu-icon" />
          <div>채팅</div>
          <div className="nav-menu-eng">Chat</div>
        </button>
        <button onClick={() => navigate('/feedback/videos')} className="nav-link nav-menu-item" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <img src={feedback} alt="피드백 아이콘" className="nav-menu-icon" />
          <div>피드백</div>
          <div className="nav-menu-eng">Feedback</div>
        </button>
      </nav>
    </header>
  );
};

export default NavBar;
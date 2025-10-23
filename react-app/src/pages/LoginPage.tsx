import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css";
import logoImg from "../logo.png";
import kakaoLogo from "./kakaologo.jpeg";
import naverLogo from "./naverlogo.jpeg";
import googleLogo from "./googlelogo.png";

export default function LoginPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/auth/login", {
        email: id,        // 백엔드에서 요구하는 필드명 확인 필요
        password: password,
      });

      // 로그인 성공 → 토큰 저장
      localStorage.setItem("token", response.data.token);

      alert("로그인 성공!");
      // 전역 UI 업데이트 트리거
      window.dispatchEvent(new Event("auth:changed"));
      navigate("/"); // 메인 페이지로 이동
    } catch (error: any) {
      console.error(error);
      alert("로그인 실패: " + (error.response?.data?.message || "알 수 없는 오류"));
    }
  };

  return (
    <div className="login-container">
      <div className="logo-wrap">
        <Link to="/">
          <img src={logoImg} alt="PlayMatch Logo" className="logo" />
        </Link>
      </div>
      <form className="form-area" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="이메일"
          value={id}
          onChange={e => setId(e.target.value)}
          className="input-box"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="input-box"
        />
        <button type="submit" className="login-btn">로그인</button>
      </form>
      <div className="option-row">
        <Link to="#">아이디 찾기</Link>
        <Link to="#">비밀번호 찾기</Link>
        <Link to="/signup">회원가입</Link>
      </div>
      <button className="social-btn google">
        <img src={googleLogo} alt="Google Icon" className="icon" />
        구글로 로그인
      </button>
      <button className="social-btn naver">
        <img src={naverLogo} alt="Naver Icon" className="icon" />
        네이버로 로그인
      </button>
      <button className="social-btn kakao">
        <img src={kakaoLogo} alt="Kakao Icon" className="icon" />
        카카오로 로그인
      </button>
    </div>
  );
}

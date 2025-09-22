// LoginPage.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./LoginPage.css";
import logoImg from "../logo.png";
import kakaoLogo from "./kakaologo.jpeg";
import naverLogo from "./naverlogo.jpeg";
import googleLogo from "./googlelogo.png";

export default function LoginPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`로그인 시도: ${id}`);
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
          placeholder="id"
          value={id}
          onChange={e => setId(e.target.value)}
          className="input-box"
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="input-box"
        />
        <button type="submit" className="login-btn">login</button>
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

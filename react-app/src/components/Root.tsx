import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import App from "../App";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import MapPopupPage from "../pages/MapPopupPage";
import MyPage from "../pages/MyPage";
import CreateMatchPage from "../pages/CreateMatchPage";

export default function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/mappopup" element={<MapPopupPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/create-match" element={<CreateMatchPage />} />
      </Routes>
    </BrowserRouter>
  );
}

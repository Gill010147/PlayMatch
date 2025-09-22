import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import NavBar from "./components/NavBar";
import KakaoMap from "./components/kakaomap";
import Banner from "./components/Banner";
import RecommendedMatchList from "./components/recommendmatch";

import "./App.css";

const recommendedMatches = [
  {
    id: "1",
    time: "10:00",
    location: "경기도 수원시 장안구 경수대로 976번길22",
    type: "야외",
    teams: "남녀모두 - 6vs6",
    status: "closed",
  },
  {
    id: "2",
    time: "10:00",
    location: "충청북도 충주시 충원대로 268",
    type: "실내",
    teams: "남녀모두 - 5vs5",
    status: "open",
  },
];

function App() {
  const [matches] = useState(recommendedMatches);
  const navigate = useNavigate();

  // 새 팝업창 열기 함수
  const openMapPopup = () => {
    window.open(
      "/popup-map.html", // 실제로 public 폴더에 popup-map.html 파일 있어야 함
      "MapPopup",
      "width=900,height=700,resizable=yes,scrollbars=yes"
    );
  };

  return (
    <>
      <NavBar />
      <div
        className="app-container"
        style={{ display: "flex", flexDirection: "column", gap: 0 }}
      >
        <div style={{ display: "flex", gap: 0, position: "relative" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <KakaoMap matches={matches} />
            <button
              onClick={openMapPopup}
              style={{
                position: "absolute",
                bottom: "16px",
                right: "16px",
                padding: "8px 16px",
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                color: "rgba(70, 55, 238, 1)",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                zIndex: 10,
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              }}
            >
              지도확대
            </button>
          </div>
          <div style={{ flex: 1 }}>
            <Banner />
          </div>
        </div>

        <div style={{ marginTop: "24px", padding: "0 16px" }}>
          <RecommendedMatchList matches={matches} />
        </div>
      </div>

      {/* 경기생성 플로팅 버튼 */}
      <button
        onClick={() => navigate("/create-match")}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          padding: "12px 18px",
          backgroundColor: "rgba(70, 55, 238, 1)",
          color: "#fff",
          border: "none",
          borderRadius: "999px",
          cursor: "pointer",
          zIndex: 1000,
          boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
          fontWeight: 600,
        }}
      >
        경기생성
      </button>
    </>
  );
}

export default App;

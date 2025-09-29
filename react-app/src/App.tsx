import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import NavBar from "./components/NavBar";
import KakaoMap from "./components/kakaomap";
import Banner from "./components/Banner";
import RecommendedMatchList from "./components/recommendmatch";
import { MatchesService } from "./services/api";

import "./App.css";

const recommendedMatches: any[] = [];

function App() {
  const [matches, setMatches] = useState(recommendedMatches);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const alreadyCleared = localStorage.getItem("playmatch.clearedOnce");
      if (!alreadyCleared) {
        MatchesService.clearAll();
        localStorage.setItem("playmatch.clearedOnce", "1");
      }
      const list = await MatchesService.list();
      setMatches(list as any);
    };
    init();
  }, []);

  // 새 팝업창 열기 함수 (현재 매치 데이터를 함께 전달)
  const openMapPopup = () => {
    const matchesParam = encodeURIComponent(JSON.stringify(matches));
    window.open(
      `/popup-map.html?matches=${matchesParam}`,
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

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import NavBar from "./components/NavBar";
import KakaoMap from "./components/kakaomap";
import Banner from "./components/Banner";
import RecommendedMatchList from "./components/recommendmatch";
import { MatchesService } from "./services/api";

import "./App.css";

function App() {
  const [matches, setMatches] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
    console.log("VITE_USE_MOCKS:", import.meta.env.VITE_USE_MOCKS);
    const init = async () => {
      try {
        const list = await MatchesService.list();
        // ✅ list가 undefined/null이어도 안전하게 처리
        setMatches(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("매치 목록 불러오기 실패:", err);
        setMatches([]); // 실패 시에도 빈 배열 유지
      }
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
          backgroundColor: "#16a34a",
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

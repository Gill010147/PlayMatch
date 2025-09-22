import { useEffect, useRef } from "react";
import './kakaomap.css';

interface Match {
  id: string;
  time: string;
  location: string;
  type: string;
  teams: string;
  status: string;
}

interface KakaoMapProps {
  matches: Match[];
}

declare global {
  interface Window {
    kakao: any;
  }
}

export default function KakaoMap({ matches }: KakaoMapProps) {
  const mapRef = useRef<any>(null);

  useEffect(() => {
    const { kakao } = window;
    if (!kakao) {
      console.error("Kakao API가 로드되지 않았습니다.");
      return;
    }

    const container = document.getElementById("map");
    if (!container) {
      console.error("지도 컨테이너가 없습니다.");
      return;
    }

    if (!mapRef.current) {
      mapRef.current = new kakao.maps.Map(container, {
        center: new kakao.maps.LatLng(37.5665, 126.978), // 서울 기본 좌표
        level: 7,
      });
    }
    const map = mapRef.current;

    const geocoder = new kakao.maps.services.Geocoder();
    const bounds = new kakao.maps.LatLngBounds();

    matches.forEach(match => {
      geocoder.addressSearch(match.location, (result: any, status: any) => {
        if (status === kakao.maps.services.Status.OK) {
          const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
          
          // 마커 생성
          const marker = new kakao.maps.Marker({
            map,
            position: coords,
          });

          // 인포윈도우 생성
          const infowindow = new kakao.maps.InfoWindow({
            content: `
              <div style="padding: 15px; min-width: 250px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${match.status === 'open' ? '#4CAF50' : '#FF5722'}; margin-right: 8px;"></div>
                  <span style="font-size: 12px; color: ${match.status === 'open' ? '#4CAF50' : '#FF5722'}; font-weight: 600; text-transform: uppercase;">
                    ${match.status === 'open' ? '모집중' : '마감'}
                  </span>
                </div>
                <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px; font-weight: 600;">${match.teams}</h3>
                <div style="margin-bottom: 8px;">
                  <span style="color: #666; font-size: 13px;">⏰ ${match.time}</span>
                </div>
                <div style="margin-bottom: 8px;">
                  <span style="color: #666; font-size: 13px;">📍 ${match.location}</span>
                </div>
                <div style="margin-bottom: 0;">
                  <span style="color: #666; font-size: 13px;">🏟️ ${match.type}</span>
                </div>
              </div>
            `,
            removable: true,
            zIndex: 1000
          });

          // 마커 클릭 시 인포윈도우 표시
          kakao.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map, marker);
          });

          bounds.extend(coords);
          map.setBounds(bounds);
        } else {
          console.warn(`주소 검색 실패: ${match.location}`);
        }
      });
    });
  }, [matches]);

  const handlePopupClick = () => {
    // 경기 데이터를 URL 파라미터로 전달
    const matchesParam = encodeURIComponent(JSON.stringify(matches));
    const popupUrl = `/popup-map.html?matches=${matchesParam}`;
    
    // 팝업창 열기
    const popup = window.open(
      popupUrl,
      'mapPopup',
      'width=800,height=600,scrollbars=yes,resizable=yes,location=yes,status=yes'
    );
    
    // 팝업이 차단된 경우 처리
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      alert('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "400px" }}>
      <div id="map" style={{ width: "100%", height: "100%" }}></div>
      <button
        onClick={handlePopupClick}
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          padding: "8px 16px",
          backgroundColor: "transparent",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          zIndex: 10,
        }}
      >
        확대
      </button>
    </div>
  );
}

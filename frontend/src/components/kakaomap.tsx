import { useEffect, useRef } from "react";
import './kakaomap.css';

// 백엔드의 MatchResponseDto와 일치하는 인터페이스
interface Match {
  id: number;
  title: string;
  hostTeamName: string;
  matchDate: string; // JSON으로 변환되면서 string이 됨
  locationName: string;
  status: string;
  memberCount: number;
  maxMemberCount: number;
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
  const markersRef = useRef<any[]>([]);
  const infoWindowsRef = useRef<any[]>([]);

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

    // 기존 마커/인포윈도우 제거
    if (markersRef.current.length) {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    }
    if (infoWindowsRef.current.length) {
      infoWindowsRef.current.forEach((w) => w.close());
      infoWindowsRef.current = [];
    }

    const geocoder = new kakao.maps.services.Geocoder();
    const bounds = new kakao.maps.LatLngBounds();
    let hasAnyVisible = false;

    matches.forEach(match => {
      if (match.locationName && match.locationName.trim() !== '') {
        geocoder.addressSearch(match.locationName, (result: any, status: any) => {
          if (status === kakao.maps.services.Status.OK) {
            const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
            
            const marker = new kakao.maps.Marker({
              map,
              position: coords,
            });

            const infowindow = new kakao.maps.InfoWindow({
              content: `
                <div style="padding: 15px; min-width: 250px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                  <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${match.status === 'RECRUITING' ? '#4CAF50' : '#FF5722'}; margin-right: 8px;"></div>
                    <span style="font-size: 12px; color: ${match.status === 'RECRUITING' ? '#4CAF50' : '#FF5722'}; font-weight: 600; text-transform: uppercase;">
                      ${match.status === 'RECRUITING' ? '모집중' : '마감'}
                    </span>
                  </div>
                  <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px; font-weight: 600;">${match.title}</h3>
                  <div style="margin-bottom: 8px;">
                    <span style="color: #666; font-size: 13px;">⏰ ${new Date(match.matchDate).toLocaleString()}</span>
                  </div>
                  <div style="margin-bottom: 8px;">
                    <span style="color: #666; font-size: 13px;">📍 ${match.locationName}</span>
                  </div>
                  <div style="margin-bottom: 0;">
                    <span style="color: #666; font-size: 13px;">👥 ${match.memberCount} / ${match.maxMemberCount}</span>
                  </div>
                </div>
              `,
              removable: true,
              zIndex: 1000
            });

            kakao.maps.event.addListener(marker, 'click', function() {
              infowindow.open(map, marker);
            });

            markersRef.current.push(marker);
            infoWindowsRef.current.push(infowindow);
            bounds.extend(coords);
            hasAnyVisible = true;
          } else {
            console.warn(`주소 검색 실패: ${match.locationName}`);
          }
          
          if (hasAnyVisible) {
            map.setBounds(bounds);
          }
        });
      }
    });

    if (!matches.length) {
      map.setLevel(7);
    }
  }, [matches]);

  const handlePopupClick = () => {
    const matchesParam = encodeURIComponent(JSON.stringify(matches));
    const popupUrl = `/popup-map.html?matches=${matchesParam}`;
    
    const popup = window.open(
      popupUrl,
      'mapPopup',
      'width=800,height=600,scrollbars=yes,resizable=yes,location=yes,status=yes'
    );
    
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
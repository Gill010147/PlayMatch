interface Match {
  id: string;
  time: string;       // 경기 시작 시간
  location: string;   // 경기장 위치
  type: string;       // 경기 종류 (ex. 축구, 풋살)
  teams: string;      // 남녀비율 등
  status: "open" | "closed";  // 신청 가능 여부
}

interface RecommendedMatchListProps {
  matches: Match[];
}
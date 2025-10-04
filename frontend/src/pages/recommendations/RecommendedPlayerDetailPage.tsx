import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Player {
  name: string;
  position: string;
  playStyle: string;
  ability: string;
  region: string;
}

const DUMMY_PLAYERS: Player[] = [
  {
    name: "홍길동",
    position: "FW",
    playStyle: "공격",
    ability: "슛",
    region: "OO시 OO구",
  },
  {
    name: "김철수",
    position: "MF",
    playStyle: "수비",
    ability: "패스",
    region: "XX시 XX구",
  },
  {
    name: "이영희",
    position: "DF",
    playStyle: "조율",
    ability: "태클",
    region: "YY시 YY구",
  },
];

const RecommendedPlayerDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const currentPlayer = DUMMY_PLAYERS[currentPlayerIndex];

  const goToNextPlayer = () => {
    setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % DUMMY_PLAYERS.length);
  };

  const goToPreviousPlayer = () => {
    setCurrentPlayerIndex((prevIndex) =>
      (prevIndex - 1 + DUMMY_PLAYERS.length) % DUMMY_PLAYERS.length
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="relative bg-green-700 text-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 text-white text-2xl"
        >
          &times;
        </button>
        <div className="flex justify-between items-center mb-4">
          <button className="text-white text-3xl" onClick={goToPreviousPlayer}>&lt;</button>
          <h2 className="text-3xl font-bold">{currentPlayer.name}</h2>
          <button className="text-white text-3xl" onClick={goToNextPlayer}>&gt;</button>
        </div>
        <div className="space-y-4 text-lg">
          <p>👦 포지션 : {currentPlayer.position}</p>
          <p>⚽ 플레이 스타일 : {currentPlayer.playStyle}</p>
          <p>🏆 능력 : {currentPlayer.ability}</p>
          <p>📍 지역 : {currentPlayer.region}</p>
        </div>
        <div className="flex justify-around mt-8">
          <button 
            onClick={() => alert('Contact button clicked!')}
            className="bg-gray-800 text-white px-6 py-3 rounded-lg text-lg"
          >
            연락하기
          </button>
          <button className="bg-gray-800 text-white px-6 py-3 rounded-lg text-lg" onClick={goToNextPlayer}>
            다음 사람
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendedPlayerDetailPage;

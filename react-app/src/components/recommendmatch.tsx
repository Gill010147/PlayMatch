import React from "react";
import './recommendmatch.css';

interface Match {
  id: string;
  time: string;
  location: string;
  type: string;
  teams: string;
  status: string;
}

interface RecommendedMatchListProps {
  matches: Match[];
}

const RecommendedMatchList: React.FC<RecommendedMatchListProps> = ({ matches }) => {
  return (
    <section className="recommended-matches">
      <h2>추천 Match</h2>
      <ul>
        {matches.map((match) => (
          <li
            key={match.id}
            className={`match-item ${match.status === "closed" ? "closed" : "open"}`}
          >
            <span className="match-time">{match.time}</span>
            <span className="match-location">{match.location}</span>
            <span className="match-detail">
              {match.type} • {match.teams}
            </span>
            <button disabled={match.status === "closed"}>
              {match.status === "closed" ? "마감임박!" : "신청가능"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default RecommendedMatchList;

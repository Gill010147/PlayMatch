import React, { useState, useEffect } from "react";
import soccerImg from "./soccer.png";
import bannerImg from "./bannerex.jpg";
import "./Banner.css";

const images = [soccerImg, bannerImg];

const Banner: React.FC = () => {
  const [idx, setIdx] = useState(0);
  const next = () => setIdx((prevIdx) => (prevIdx + 1) % images.length);
  // const prev = () => setIdx((idx - 1 + images.length) % images.length);

  useEffect(() => {
    const interval = setInterval(() => {
      next();
    }, 5000); // Change image every 3 seconds
    return () => clearInterval(interval);
  }, [next]);

  return (
    <div className="banner-container">
      {/* <button className="arrow-btn arrow-left" onClick={prev}>&#x25C0;</button> */}
      <img src={images[idx]} alt="banner" />
      {/* <button className="arrow-btn arrow-right" onClick={next}>&#x25B6;</button> */}
    </div>
  );
};

export default Banner;

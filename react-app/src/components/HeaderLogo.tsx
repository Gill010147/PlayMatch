import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../logo.png";

export default function HeaderLogo() {
  const navigate = useNavigate();
  return (
    <header
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "30px",
      }}
    >
      <img
        src={logo}
        alt="Play Match Logo"
        style={{ height: "56px", cursor: "pointer" }}
        onClick={() => navigate("/")}
      />
    </header>
  );
}














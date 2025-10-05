import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TeamsService } from "../../services/api"; // ✅ axios 직접 사용 금지

export default function CreateTeamProfilePage() {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState("");
  const [shortIntroduction, setShortIntroduction] = useState("");
  const [mainArea, setMainArea] = useState("");
  const [teamLogo, setTeamLogo] = useState<File | null>(null);
  const [teamLogoPreview, setTeamLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ✅ 파일 변경 시 미리보기
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        alert("PNG, JPG, JPEG 파일만 업로드 가능합니다.");
        e.target.value = "";
        setTeamLogo(null);
        setTeamLogoPreview(null);
        return;
      }
      setTeamLogo(file);
      setTeamLogoPreview(URL.createObjectURL(file));
    } else {
      setTeamLogo(null);
      setTeamLogoPreview(null);
    }
  };

  // ✅ 미리보기 메모리 해제
  useEffect(() => {
    return () => {
      if (teamLogoPreview) URL.revokeObjectURL(teamLogoPreview);
    };
  }, [teamLogoPreview]);

  // ✅ 제출 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    if (!teamName || !shortIntroduction) {
      alert("팀명과 짧은 소개를 모두 입력해주세요.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      const requestDto = {
        name: teamName,
        introduce: shortIntroduction,
        mainArea: mainArea, // mainArea 추가
      };
      formData.append(
        "requestDto",
        new Blob([JSON.stringify(requestDto)], { type: "application/json" })
      );

      if (teamLogo) formData.append("logo", teamLogo); // 파일은 "logo" 라는 이름으로 전송

      await TeamsService.createWithFile(formData); // 서비스 호출
      alert("팀 프로필이 성공적으로 생성되었습니다.");
      navigate("/mypage", { state: { refresh: true } });
    } catch (error: any) {
      console.error("팀 프로필 생성 실패:", error);
      alert("팀 프로필 생성 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "24px", color: "#333" }}>
        팀 프로필 생성
      </h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        <div>
          <label
            htmlFor="teamLogo"
            style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
          >
            팀 로고:
          </label>
          <input
            type="file"
            id="teamLogo"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleLogoChange}
            style={{
              border: "1px solid #ddd",
              padding: "8px",
              borderRadius: "4px",
              width: "100%",
            }}
          />
          {teamLogoPreview && (
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <img
                src={teamLogoPreview}
                alt="Team Logo Preview"
                style={{
                  maxWidth: "200px",
                  maxHeight: "200px",
                  borderRadius: "8px",
                  border: "1px solid #eee",
                }}
              />
            </div>
          )}
          {teamLogo && (
            <p style={{ marginTop: "8px" }}>선택한 파일: {teamLogo.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="teamName"
            style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
          >
            팀명:
          </label>
          <input
            type="text"
            id="teamName"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="팀명을 입력해주세요."
            style={{
              border: "1px solid #ddd",
              padding: "8px",
              borderRadius: "4px",
              width: "100%",
            }}
            required
          />
        </div>

        <div>
          <label
            htmlFor="shortIntroduction"
            style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
          >
            짧은 소개:
          </label>
          <textarea
            id="shortIntroduction"
            value={shortIntroduction}
            onChange={(e) => setShortIntroduction(e.target.value)}
            placeholder="팀을 짧게 소개해주세요."
            rows={5}
            style={{
              border: "1px solid #ddd",
              padding: "8px",
              borderRadius: "4px",
              width: "100%",
              resize: "vertical",
            }}
            required
          />
        </div>

        <div>
          <label
            htmlFor="mainArea"
            style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
          >
            주요 활동 지역:
          </label>
          <input
            type="text"
            id="mainArea"
            value={mainArea}
            onChange={(e) => setMainArea(e.target.value)}
            placeholder="주요 활동 지역을 입력해주세요. (예: 서울시 강남구)"
            style={{
              border: "1px solid #ddd",
              padding: "8px",
              borderRadius: "4px",
              width: "100%",
            }}
            required
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "12px 18px",
            backgroundColor: "#16a34a",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
          disabled={saving}
        >
          {saving ? "등록 중..." : "팀 등록하기"}
        </button>
      </form>
    </div>
  );
}

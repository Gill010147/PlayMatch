import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignupPage.css";
import logoImg from "../logo.png";

type Gender = "male" | "female" | "";

const years = Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - i));
const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

const POSITIONS = ["공격수", "미드필더", "수비수", "골키퍼"] as const;
const PLAY_STYLES = ["공격", "밸런스", "수비"] as const;
const SKILLS = ["슛", "패스", "드리블", "스피드", "골키퍼"] as const;

// 카카오 주소검색 타입 선언
declare global {
  interface Window {
    daum: any;
  }
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [gender, setGender] = useState<Gender>("");
  const [phone, setPhone] = useState("");
  const [verification, setVerification] = useState("");

  const [positions, setPositions] = useState<string[]>([]);
  const [playStyles, setPlayStyles] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);

  // 지역 정보
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [fullAddress, setFullAddress] = useState("");

  const toggleValue = (list: string[], value: string) =>
    list.includes(value) ? list.filter(v => v !== value) : [...list, value];

  const isValid = useMemo(() => {
    return (
      email &&
      password &&
      passwordConfirm &&
      password === passwordConfirm &&
      name &&
      year &&
      month &&
      day &&
      gender &&
      phone &&
      positions.length > 0 &&
      playStyles.length > 0 &&
      skills.length > 0 &&
      fullAddress
    );
  }, [email, password, passwordConfirm, name, year, month, day, gender, phone, positions, playStyles, skills, fullAddress]);

  // 카카오 주소 검색
  const openPostcode = () => {
    new window.daum.Postcode({
      oncomplete: (data: any) => {
        const sido = data.sido;        // 시/도
        const sigungu = data.sigungu;  // 시/군/구
        const bname = data.bname;      // 동

        setCity(sido);
        setDistrict(sigungu);
        setNeighborhood(bname);
        setFullAddress(data.address);
      },
    }).open();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const profile = {
      email,
      name,
      birth: { year, month, day },
      gender,
      phone,
      positions,
      playStyles,
      skills,
      region: { city, district, neighborhood, fullAddress },
    };
    try {
      localStorage.setItem("userProfile", JSON.stringify(profile));
    } catch {}
    alert("회원가입이 완료되었습니다.");
    navigate("/");
  };

  return (
    <div className="signup-container">
      <div className="logo-wrap">
        <Link to="/">
          <img src={logoImg} alt="PlayMatch Logo" className="logo" />
        </Link>
      </div>
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2 className="form-title">회원가입</h2>

        <label className="field">
          <span>이메일</span>
          <input type="email" placeholder="이메일을 입력하세요" value={email} onChange={e => setEmail(e.target.value)} />
        </label>

        <label className="field">
          <span>비밀번호</span>
          <input type="password" placeholder="비밀번호를 입력하세요" value={password} onChange={e => setPassword(e.target.value)} />
        </label>

        <label className="field">
          <span>비밀번호 확인</span>
          <input type="password" placeholder="비밀번호를 한 번 더 입력하세요" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} />
          {passwordConfirm && (
            <span className={`hint ${passwordConfirm === password ? "ok" : "error"}`}>
              {passwordConfirm === password ? "비밀번호가 같습니다" : "비밀번호가 다릅니다"}
            </span>
          )}
        </label>

        <label className="field">
          <span>이름</span>
          <input type="text" placeholder="이름을 입력하세요" value={name} onChange={e => setName(e.target.value)} />
        </label>

        
        <div className="field-group">
          <span className="label">지역</span>
          <div className="row gap">
            <span>{fullAddress || "주소를 검색해주세요."}</span>
            <button type="button" onClick={openPostcode}>주소 검색</button>
          </div>
        </div>

        <div className="field-group">
          <span className="label">생년월일</span>
          <div className="row gap">
            <select value={year} onChange={e => setYear(e.target.value)}>
              <option value="">년도</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select value={month} onChange={e => setMonth(e.target.value)}>
              <option value="">월</option>
              {months.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select value={day} onChange={e => setDay(e.target.value)}>
              <option value="">일</option>
              {days.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="field-group">
          <span className="label">성별</span>
          <div className="row gap">
            <button type="button" className={`chip ${gender === "male" ? "selected" : ""}`} onClick={() => setGender("male")}>남자</button>
            <button type="button" className={`chip ${gender === "female" ? "selected" : ""}`} onClick={() => setGender("female")}>여자</button>
          </div>
        </div>

        <label className="field">
          <span>휴대폰 번호</span>
          <input type="tel" placeholder="휴대폰 번호를 입력하세요" value={phone} onChange={e => setPhone(e.target.value)} />
        </label>

        <label className="field">
          <span>인증 번호</span>
          <input type="text" placeholder="인증 번호를 입력하세요" value={verification} onChange={e => setVerification(e.target.value)} />
        </label>

        <h3 className="section-title">기본 프로필</h3>

        <div className="field-group">
          <span className="label">포지션</span>
          <div className="grid-3">
            {POSITIONS.map(p => (
              <button
                key={p}
                type="button"
                className={`chip ${positions.includes(p) ? "selected" : ""}`}
                onClick={() => setPositions(prev => toggleValue(prev, p))}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="field-group">
          <span className="label">플레이 스타일</span>
          <div className="grid-3">
            {PLAY_STYLES.map(ps => (
              <button
                key={ps}
                type="button"
                className={`chip ${playStyles.includes(ps) ? "selected" : ""}`}
                onClick={() => setPlayStyles(prev => toggleValue(prev, ps))}
              >
                {ps}
              </button>
            ))}
          </div>
        </div>

        <div className="field-group">
          <span className="label">자신있는 능력</span>
          <div className="grid-3">
            {SKILLS.map(s => (
              <button
                key={s}
                type="button"
                className={`chip ${skills.includes(s) ? "selected" : ""}`}
                onClick={() => setSkills(prev => toggleValue(prev, s))}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button className="submit" type="submit" disabled={!isValid}>회원가입</button>
      </form>
    </div>
  );
}

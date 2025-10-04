import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthService, ApiError } from "../services/api"; // ApiError 임포트 추가
import "./SignupPage.css";
import logoImg from "../logo.png";

type Gender = "male" | "female" | "";

const years = Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - i));
const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

const POSITIONS = ["공격수", "미드필더", "수비수", "골키퍼"] as const;
const PLAY_STYLES = [
  "포처형", "골게터", "드리블러", "플레이메이커", "측면돌파", "윙어", "세컨드톱", "침투형", "타겟맨", "세트피스전문", "원터치패스", "롱샷형", "크로스중심", "기회포착형", "트릭키",
  "박스투박스", "연계형", "중앙지배형", "전방압박", "빌드업형", "멀티플레이어", "세컨드볼헌터", "볼운반형", "롤링형", "템포조절형", "후방플레이메이커", "팀워크형", "연결고리", "활동량중심", "다재다능",
  "클리어링형", "빌드업수비", "대인마크", "스위퍼", "태클러", "인터셉터", "공중볼강점", "라인컨트롤", "수비리더", "철벽형", "안정지향", "압박수비", "지역방어", "하프스페이스커버", "세트피스수비전문",
  "체력형", "피지컬형", "전술준수형", "프리스타일형", "리더십형", "파이팅형", "스피드형", "패스형", "슈팅형", "크리에이터형", "카리스마형", "침착형", "승부근성형", "감각형", "팀플레이형"
] as const;
const SKILLS = [
  "슈팅", "중거리슛", "헤딩", "드리블", "침투", "돌파력", "결정력", "크로스",
  "트래핑", "볼키핑", "1:1 돌파", "세트피스", "프리킥", "페널티킥", "연계플레이",
  "패스", "롱패스", "숏패스", "시야", "전환", "볼배급", "템포조절", "볼운반",
  "원터치패스", "빌드업", "중거리전개", "창의성", "전술이해", "경기조율",
  "태클", "인터셉트", "대인마크", "압박", "클리어링", "위치선정", "라인컨트롤",
  "수비조율", "차단", "커버링", "공중볼", "몸싸움", "블로킹", "수비리더십",
  "반사신경", "선방", "킥", "공중장악", "GK 위치선정", "1:1 대응",
  "빌드업능력", "GK 의사소통", "GK 리더십",
  "스피드", "가속력", "지구력", "체력", "민첩성", "밸런스", "점프력", "파워",
  "볼컨트롤", "멀티포지션", "경기운영", "정신력", "승부근성", "팀워크",
  "리더십", "의사소통", "적응력"
] as const;

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

  // 회원가입 API 호출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      const response = await AuthService.register({
        email,
        password,
        name,
        age: year, // age 필드 추가 (year 사용)
        gender,
        phone, // phone 필드 추가
        positions,
        playStyles,
        skills,
        fullAddress, // fullAddress 필드 추가
      });

      alert("회원가입 성공!");
      console.log("회원가입 응답:", response);
      navigate("/"); // 성공 시 메인으로 이동
    } catch (error: any) {
      console.error(error);
      alert("회원가입 실패: " + (error.message || "알 수 없는 오류"));
    }
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

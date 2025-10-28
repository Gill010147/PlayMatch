# 🚀 PlayMatch: Spring Boot & React 기반 축구/풋살 매칭 플랫폼

![Java](https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white) ![Spring](https://img.shields.io/badge/spring-%236DB33F.svg?style=for-the-badge&logo=spring&logoColor=white) ![React](https://img.shields.io/badge/react-%2320232A.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) ![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)

<img width="1576" height="812" alt="image" src="https://github.com/user-attachments/assets/e88dec3d-c964-4c59-88fe-dadd9a52e347" />


## 1. 📖 프로젝트 개요

`PlayMatch`는 아마추어 축구 및 풋살 팀을 위한 매칭 플랫폼으로, 팀 관리, 경기 매칭, 그리고 팀원(용병) 모집을 원활하게 할 수 있도록 돕는 서비스입니다. Spring Boot와 React를 기반으로 하여 안정적인 백엔드와 반응형 프론트엔드를 구축했으며, 사용자 경험을 극대화하기 위해 실시간 채팅, 좌표 기반 추천 등 다양한 기술을 적용했습니다.

---

## 2. ✨ 주요 기능 (Key Features)

- **🧠 지능형 용병 추천:** 거리, 포지션, 스킬 등 복합적인 가중치를 적용하여 팀에 가장 적합한 용병을 추천합니다.
- **💬 실시간 채팅:** WebSocket(STOMP)과 Redis를 이용하여 서버 확장에도 유연하게 대응할 수 있는 실시간 채팅 기능을 제공합니다.
- **⚽ 팀 및 경기 관리:** 팀과 경기를 생성, 조회, 수정, 삭제하는 기본적인 매칭 플랫폼의 기능을 구현했습니다.
- **🎬 비디오 피드백:** 경기 영상을 업로드하고 댓글을 통해 피드백을 주고받는 커뮤니티 기능을 제공합니다.
- **🗺️ 지도 기반 탐색:** Kakao Map API를 연동하여 주변의 경기나 팀을 직관적으로 탐색할 수 있습니다.

---

## 3. 🏛️ 시스템 아키텍처

본 프로젝트는 역할과 책임 분리를 통해 유지보수성과 확장성을 높이는 현대적인 웹 애플리케이션 아키텍처를 채택했습니다.

- **Backend: 계층형 아키텍처 (Layered Architecture)**
  - **Controller Layer:** 클라이언트의 HTTP 요청을 받아 서비스 계층으로 처리를 위임합니다.
  - **Service Layer:** 애플리케이션의 핵심 비즈니스 로직을 처리하고 트랜잭션을 관리합니다.
  - **Repository Layer:** Spring Data JPA를 사용하여 데이터베이스와의 통신을 담당합니다.
  - **Domain Layer:** 데이터베이스 테이블과 매핑되는 핵심 데이터 모델입니다.

- **Frontend: 컴포넌트 기반 아키텍처 (Component-Based Architecture)**
  - **Pages & Components:** 각 페이지와 재사용 가능한 UI 단위로 UI를 설계하여 개발 효율성을 높였습니다.
  - **Services:** 백엔드 API 호출을 담당하는 모듈로 UI 로직과 비즈니스 로직을 분리합니다.
  - **Context API:** 전역 상태(로그인 정보 등)를 관리합니다.

---

## 4. 📸 핵심 기능 시연

### 지능형 용병 추천
<img width="780" height="463" alt="image" src="https://github.com/user-attachments/assets/59ae85dd-e301-44de-b86b-868cdb97da3b" />

*사용자가 원하는 포지션, 스킬, 지역을 선택하면, 하버사인 공식(Haversine formula)을 이용한 거리 점수를 포함한 복합적인 가중치 시스템을 통해 최적의 용병을 추천합니다. 결과는 넘겨볼 수 있는 캐러셀 UI로 제공되며, '연락하기' 버튼으로 즉시 1:1 채팅을 시작할 수 있습니다.*

### 실시간 채팅
<img width="928" height="817" alt="image" src="https://github.com/user-attachments/assets/379d6538-ed2d-448c-9ea6-a22c660eab61" />

*STOMP와 Redis 메시지 브로커를 기반으로 구현된 실시간 채팅 화면입니다. 이를 통해 여러 서버 인스턴스 환경에서도 지연 없이 안정적인 메시지 송수신이 가능합니다.*

---

## 5. 🛠️ 기술 스택 (Tech Stack)

| 구분 | 기술 | 상세 내용 |
| :--- | :--- | :--- |
| **Backend** | ☕ Java 17 | | 
| | 🍃 Spring Boot 3.x | Spring Security, Spring Data JPA, WebSocket |
| | 🐘 Gradle | 의존성 관리 및 빌드 도구 |
| | 🐘 PostgreSQL | 주 데이터베이스 |
| | ⚡ Redis | 채팅 메시지 브로커 및 JWT 블랙리스트 관리 |
| | 🔑 JWT | JSON Web Token 기반 인증 |
| **Frontend** | ⚛️ React | UI 라이브러리 |
| | 🔷 TypeScript | 타입 안정성 확보 |
| | ⚡ Vite | 차세대 프론트엔드 빌드 도구 |
| | 🎨 CSS3 | 스타일링 |
| **APIs** | 🗺️ Kakao Maps API | 지도 표시, 주소-좌표 변환 |
| | 📮 Kakao Postcode API | 주소 검색 |

---

## 6. ⚙️ 로컬 환경에서 실행하기

### 사전 준비
- Java 17
- Node.js 20.x
- Docker

### 1. 데이터베이스 및 Redis 실행

프로젝트 루트의 `docker-compose.yml` 파일을 사용하여 PostgreSQL과 Redis를 실행합니다.

```bash
docker-compose up -d
```

### 2. 백엔드 서버 실행

1.  `build.gradle` 파일의 `plugins`가 아래와 같이 설정되어 있는지 확인합니다.

    ```groovy
    plugins {
        id 'java'
        id 'org.springframework.boot' version '3.3.2'
        id 'io.spring.dependency-management' version '1.1.5'
    }
    ```

2.  `src/main/resources/application.yml` 파일을 열어 본인의 환경에 맞게 수정합니다.

    ```yaml
    spring:
      datasource:
        password: YOUR_DATABASE_PASSWORD # 여기에 본인의 DB 비밀번호를 입력하세요.
    jwt:
      secret:
        key: YOUR_JWT_SECRET_KEY # 여기에 256비트 이상의 긴 무작위 문자열을 입력하세요.
    ```

3.  아래 명령어로 백엔드 서버를 실행합니다. (기본 포트: `8080`)

    ```bash
    ./gradlew bootRun
    ```

### 3. 프론트엔드 서버 실행

1.  `frontend` 디렉토리로 이동하여 의존성을 설치합니다.

    ```bash
    cd frontend
    npm install
    ```

2.  `frontend/.env` 파일을 생성하고, 백엔드 서버 주소를 입력합니다.

    ```
    VITE_API_BASE_URL=http://localhost:8080
    ```

3.  아래 명령어로 프론트엔드 개발 서버를 실행합니다. (기본 포트: `5173`)

    ```bash
    npm run dev
    ```

4.  브라우저에서 `http://localhost:5173`으로 접속합니다.

---

## 7. 📚 전체 API 명세

<details>
<summary>👉 전체 API 명세 보기 (클릭하여 펼치기)</summary>

### 1. 사용자 인증 및 프로필 (Auth & Users)

| Method | Path | 설명 |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | 회원가입 |
| `POST` | `/api/auth/login` | 로그인 (JWT 토큰 발급) |
| `POST` | `/api/auth/logout` | 로그아웃 (서버에서 토큰 만료 처리) |
| `GET` | `/api/users/me` | 현재 로그인한 내 프로필 정보 조회 |
| `PUT` | `/api/users/me` | 내 프로필 정보 수정 |
| `GET` | `/api/users/{userId}` | 특정 사용자의 프로필 정보 조회 |

### 2. 팀 (Teams)

| Method | Path | 설명 |
| :--- | :--- | :--- |
| `POST` | `/api/teams` | 신규 팀 생성 |
| `GET` | `/api/teams` | 전체 팀 목록 조회 (검색 포함) |
| `GET` | `/api/teams/my` | 내가 속한 팀 목록 조회 |
| `GET` | `/api/teams/{teamId}` | 특정 팀의 상세 정보 조회 |
| `PUT` | `/api/teams/{teamId}` | 팀 정보 수정 |
| `DELETE` | `/api/teams/{teamId}` | 팀 삭제 |
| `POST` | `/api/teams/{teamId}/apply` | 특정 팀에 가입 신청 |
| `GET` | `/api/teams/{teamId}/applications` | 특정 팀의 가입 신청 목록 조회 (팀장) |
| `POST` | `/api/teams/{teamId}/applications/{applicationId}` | 가입 신청 상태 변경 (수락/거절) (팀장) |

### 3. 경기 (Matches)

| Method | Path | 설명 |
| :--- | :--- | :--- |
| `POST` | `/api/matches` | 신규 경기 생성 |
| `GET` | `/api/matches` | 전체 경기 목록 조회 |
| `GET` | `/api/matches/{matchId}` | 특정 경기의 상세 정보 조회 |
| `POST` | `/api/matches/{matchId}/apply` | 특정 경기에 용병으로 참여 신청 |
| `GET` | `/api/matches/{matchId}/participants` | 특정 경기의 참여자 목록 조회 |

### 4. 용병 추천 (Recommendations)

| Method | Path | 설명 |
| :--- | :--- | :--- |
| `POST` | `/api/recommendations/players` | 조건 기반 용병 추천 목록 조회 |

### 5. 실시간 채팅 (Chat)

| Type | Path | 설명 |
| :--- | :--- | :--- |
| `GET` | `/api/chat/my-rooms` | 내 채팅방 목록 조회 |
| `POST` | `/api/chat/rooms` | 1:1 채팅방 생성 또는 기존 채팅방 조회 |
| `GET` | `/api/chat/rooms/{roomId}/messages`| 특정 채팅방의 이전 대화 내용 조회 |
| `GET` | `/api/chat/unread-count` | 읽지 않은 전체 메시지 수 조회 |
| `(WS)` | `pub/chat/message` | STOMP를 통한 메시지 발행(전송) |
| `(WS)` | `sub/chat/room/{roomId}` | STOMP를 통한 특정 채팅방 구독(수신) |

### 6. 리뷰 (Reviews)

| Method | Path | 설명 |
| :--- | :--- | :--- |
| `POST` | `/api/reviews` | 사용자 또는 팀에 대한 리뷰 작성 |
| `GET` | `/api/reviews/users/{userId}` | 특정 사용자에 대한 리뷰 목록 조회 |
| `GET` | `/api/reviews/teams/{teamId}` | 특정 팀에 대한 리뷰 목록 조회 |

### 7. 비디오 피드백 (Video Feedbacks)

| Method | Path | 설명 |
| :--- | :--- | :--- |
| `POST` | `/api/video-feedbacks` | 비디오 피드백 게시물 업로드 |
| `GET` | `/api/video-feedbacks` | 전체 비디오 피드백 목록 조회 |
| `GET` | `/api/video-feedbacks/{videoId}` | 특정 비디오 피드백 상세 조회 |
| `PUT` | `/api/video-feedbacks/{videoId}` | 비디오 피드백 정보 수정 |
| `DELETE` | `/api/video-feedbacks/{videoId}` | 비디오 피드백 삭제 |
| `POST` | `/api/video-feedbacks/{videoId}/comments` | 특정 비디오 피드백에 댓글 작성 |
| `PUT` | `/api/video-feedbacks/{videoId}/comments/{commentId}` | 댓글 수정 |
| `DELETE` | `/api/video-feedbacks/{videoId}/comments/{commentId}` | 댓글 삭제 |

</details>

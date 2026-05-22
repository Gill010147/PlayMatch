# PlayMatch: Spring Boot & React 기반 축구/풋살 매칭 플랫폼

## 1. 프로젝트 개요

`PlayMatch`는 아마추어 축구 및 풋살 팀을 위한 매칭 플랫폼으로, 팀 관리, 경기 매칭, 그리고 팀원(용병) 모집을 원활하게 할 수 있도록 돕는 서비스입니다. Spring Boot와 React를 기반으로 하여 안정적인 백엔드와 반응형 프론트엔드를 구축했으며, 사용자 경험을 극대화하기 위해 실시간 채팅, 좌표 기반 추천 등 다양한 기술을 적용했습니다.

---

## 2. 시스템 아키텍처

본 프로젝트는 역할과 책임 분리를 통해 유지보수성과 확장성을 높이는 현대적인 웹 애플리케이션 아키텍처를 채택했습니다.

### 2.1. 백엔드: 계층형 아키텍처 (Layered Architecture)

Spring Boot의 표준적인 아키텍처 패턴을 따르며, 각 계층은 명확히 구분된 역할을 수행합니다.

- **Controller Layer (`@RestController`):** 클라이언트의 HTTP 요청을 받아 유효성을 검증하고, 서비스 계층으로 처리를 위임한 뒤, 그 결과를 HTTP 응답으로 반환합니다. (MVC 패턴의 Controller 역할)
- **Service Layer (`@Service`):** 애플리케이션의 핵심 비즈니스 로직을 처리합니다. 트랜잭션 관리 등 핵심 로직이 이곳에서 수행됩니다.
- **Repository Layer (`@Repository`):** Spring Data JPA를 사용하여 데이터베이스와의 통신(CRUD)을 담당합니다.
- **Domain Layer (`@Entity`):** 데이터베이스 테이블과 매핑되는 핵심 데이터 모델입니다. (MVC 패턴의 Model 역할)

### 2.2. 프론트엔드: 컴포넌트 기반 아키텍처 (Component-Based Architecture)

React의 핵심 사상인 컴포넌트 기반으로 UI를 설계하여, 코드의 재사용성과 개발 효율성을 높였습니다.

- **Pages:** 각 페이지(라우트)를 의미하는 최상위 컴포넌트입니다.
- **Components:** 버튼, 입력창, 카드 등 재사용 가능한 UI 단위입니다.
- **Services:** 백엔드 API 호출을 담당하는 모듈로, UI 컴포넌트로부터 비즈니스 로직을 분리합니다.
- **Context API:** 전역 상태(로그인 정보, 매치 목록 등)를 관리하여 컴포넌트 간 데이터 전달을 용이하게 합니다.

---

## 3. 핵심 기능 상세

### 3.1. 지능형 용병 추천 시스템

팀에 부족한 용병을 지능적으로 추천받는 핵심 기능입니다.

- **기능:** 사용자가 원하는 용병의 조건(포지션, 플레이 스타일, 능력, **활동 지역**)을 입력하면, 시스템에 등록된 다른 사용자 중에서 가장 적합한 순으로 추천 목록을 제공합니다.
- **핵심 로직:**
  - **가중치 기반 점수 시스템:** 조건별 중요도에 따라 차등 점수를 부여하여 '매칭 점수'를 계산합니다.
  - **좌표 기반 거리 계산:** 하버사인 공식(Haversine Formula)을 이용해 실제 거리를 계산하고, 근접성에 따라 높은 가중치(최대 20점)를 부여합니다.
- **UI/UX:** 검색 결과는 한 명씩 넘겨볼 수 있는 캐러셀(Carousel) 형태로 제공되며, '연락하기' 버튼으로 즉시 1:1 채팅을 시작할 수 있습니다.

### 3.2. 실시간 채팅 시스템

사용자 간의 원활한 소통을 위해 웹소켓(WebSocket) 기반의 실시간 채팅 기능을 구현했습니다.

- **핵심 기술:**
  - **STOMP:** 메시지 발행(Publish) 및 구독(Subscribe) 모델을 쉽게 구현하기 위한 프로토콜로 사용했습니다.
  - **Redis:** 메시지 브로커 역할을 수행합니다. 이를 통해 서버가 여러 대로 확장(Scale-out)되어도 모든 서버의 사용자가 메시지를 주고받을 수 있는 확장성 높은 구조를 확보했습니다.

### 3.3. 비디오 피드백 게시판

경기 영상이나 개인 훈련 영상을 업로드하여 다른 사용자들로부터 피드백(댓글)을 받을 수 있는 커뮤니티 기능입니다.

- **주요 기능:** 동영상 업로드, 상세 보기, 댓글 작성/수정/삭제 기능을 제공합니다.
- **권한 관리:** Spring Security와 연동하여, 영상 및 댓글의 수정/삭제는 작성자 본인만 가능하도록 서버 레벨에서 권한을 제어합니다.

### 3.4. 지도 기반 경기 조회

예정된 경기들의 위치를 지도 위에 시각적으로 표시하여 사용자가 쉽게 주변의 경기를 탐색할 수 있도록 합니다.

- **핵심 기술:** Kakao Map API를 활용하여 경기 장소의 주소를 좌표로 변환하고, 지도 위에 마커로 표시합니다.
- **사용자 경험:** 단순 목록이 아닌 지도를 통해 경기 정보를 직관적으로 탐색할 수 있습니다.

### 3.5. 사용자 및 팀 관리

서비스의 기본이 되는 사용자 인증 및 팀 생성/관리 기능입니다.

- **사용자:** JWT(JSON Web Token) 기반의 인증 시스템을 구축하여 보안성을 높였습니다. 회원가입 시 상세 프로필(포지션, 스킬 등)을 입력받아 추천 시스템의 기반 데이터로 활용합니다.
- **팀:** 사용자는 팀을 생성하고, 팀 로고, 소개, 최대 인원 등을 설정할 수 있습니다. 팀 정보 수정 및 팀원 관리 기능을 제공합니다.

---

## 4. 사용된 주요 기술 스택

- **Backend:** Java, Spring Boot, Spring Security, JPA/Hibernate, Gradle, PostgreSQL, Redis
- **Frontend:** React, TypeScript, Vite, CSS
- **API & Libraries:** Kakao Maps API, Kakao Postcode API


# PlayMatch 프로젝트 전체 API 명세

## 1. 사용자 인증 및 프로필 (Auth & Users)

| Method | Path | 설명 |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | 회원가입 |
| `POST` | `/api/auth/login` | 로그인 (JWT 토큰 발급) |
| `POST` | `/api/auth/logout` | 로그아웃 (서버에서 토큰 만료 처리) |
| `GET` | `/api/users/me` | 현재 로그인한 내 프로필 정보 조회 |
| `PUT` | `/api/users/me` | 내 프로필 정보 수정 |
| `GET` | `/api/users/{userId}` | 특정 사용자의 프로필 정보 조회 |

## 2. 팀 (Teams)

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

## 3. 경기 (Matches)

| Method | Path | 설명 |
| :--- | :--- | :--- |
| `POST` | `/api/matches` | 신규 경기 생성 |
| `GET` | `/api/matches` | 전체 경기 목록 조회 |
| `GET` | `/api/matches/{matchId}` | 특정 경기의 상세 정보 조회 |
| `POST` | `/api/matches/{matchId}/apply` | 특정 경기에 용병으로 참여 신청 |
| `GET` | `/api/matches/{matchId}/participants` | 특정 경기의 참여자 목록 조회 |

## 4. 용병 추천 (Recommendations)

| Method | Path | 설명 |
| :--- | :--- | :--- |
| `POST` | `/api/recommendations/players` | 조건 기반 용병 추천 목록 조회 |

## 5. 실시간 채팅 (Chat)

| Type | Path | 설명 |
| :--- | :--- | :--- |
| `GET` | `/api/chat/my-rooms` | 내 채팅방 목록 조회 |
| `POST` | `/api/chat/rooms` | 1:1 채팅방 생성 또는 기존 채팅방 조회 |
| `GET` | `/api/chat/rooms/{roomId}/messages`| 특정 채팅방의 이전 대화 내용 조회 |
| `GET` | `/api/chat/unread-count` | 읽지 않은 전체 메시지 수 조회 |
| `(WS)` | `pub/chat/message` | STOMP를 통한 메시지 발행(전송) |
| `(WS)` | `sub/chat/room/{roomId}` | STOMP를 통한 특정 채팅방 구독(수신) |

## 6. 리뷰 (Reviews)

| Method | Path | 설명 |
| :--- | :--- | :--- |
| `POST` | `/api/reviews` | 사용자 또는 팀에 대한 리뷰 작성 |
| `GET` | `/api/reviews/users/{userId}` | 특정 사용자에 대한 리뷰 목록 조회 |
| `GET` | `/api/reviews/teams/{teamId}` | 특정 팀에 대한 리뷰 목록 조회 |

## 7. 비디오 피드백 (Video Feedbacks)

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
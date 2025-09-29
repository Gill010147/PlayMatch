## PlayMatch 프로젝트: 채팅 기능 구현 중 발생한 빌드 시스템 충돌 문제 해결기

### 1. 문제 현상

채팅 기능 구현을 위해 `spring-boot-starter-websocket` 의존성을 추가한 직후, 원인을 알 수 없는 `Context Loading` 실패 에러가 발생하며 모든 테스트(30개 이상)가 실패하기 시작했다. 에러 로그는 `java.lang.IllegalStateException at Assert.java:97`를 가리켰지만, 직접적인 원인을 파악하기 어려웠다.

특히, `gradlew clean`이나 `gradlew --stop` 명령어로 빌드 환경을 초기화한 직후의 첫 테스트는 성공하지만, 그 다음 테스트부터는 100% 실패하는 'Flaky Test(변덕스러운 테스트)' 현상이 발생하여 디버깅에 큰 어려움을 겪었다.

### 2. 초기 진단 및 실패 과정

초기에는 WebSocket 관련 설정이 기존의 웹 및 보안 설정과 충돌했을 것으로 가정하고 아래와 같은 해결책들을 순서대로 시도했으나, 모두 실패했다.

*   **1차 시도: 컨트롤러 역할 분리**
    *   가설: `@RestController`와 `@MessageMapping`이 한 클래스에 공존하여 발생한 충돌.
    *   조치: 기존 `ChatController`를 `ChatApiController`(REST)와 `StompChatController`(WebSocket)로 분리.
    *   결과: 실패. 동일한 컨텍스트 로딩 에러 발생.

*   **2차 시도: Spring Security 경로 허용**
    *   가설: Spring Security가 WebSocket 핸드셰이크 경로(`/ws-stomp`)를 차단.
    *   조치: `SecurityConfig`에 해당 경로를 `permitAll()`로 명시적으로 허용.
    *   결과: 실패. 동일한 컨텍스트 로딩 에러 발생.

*   **3차 시도: STOMP 인증 방식 변경**
    *   가설: `@MessageMapping` 메서드에서 사용자 인증 정보(`Principal`, `@AuthenticationPrincipal`) 주입 방식의 문제.
    *   조치: `Principal` -> `@AuthenticationPrincipal` -> `SimpMessageHeaderAccessor` -> 클라이언트에서 `sender` 정보 직접 전송 등 다양한 방식으로 수정.
    *   결과: `NullPointerException` 등 2차적인 에러만 발생했을 뿐, 근본적인 컨텍스트 로딩 문제는 해결되지 않음.

### 3. 근본 원인 재분석 및 최종 해결

모든 시도가 실패하고, `clean` 직후에만 테스트가 성공하는 현상을 통해 문제의 원인이 코드 레벨이 아닌 **빌드 시스템과 테스트 환경의 설정 충돌**에 있음을 확신하게 되었다.

`@EnableWebSocketMessageBroker` 어노테이션이 활성화되면, 스프링 부트는 테스트 환경에서도 실제 메시징 시스템을 구성하려 시도한다. 이 과정이 `@SpringBootTest`가 구성하는 모의(Mock) 웹 환경과 충돌을 일으켜, 정상적인 빈(Bean) 생성을 방해하고 컨텍스트 로딩 실패로 이어졌던 것이다.

**최종 해결책: `@Profile`을 이용한 테스트 환경 분리**

*   **조치:**
    1.  `WebSocketConfig` 클래스에 `@Profile("!test")` 어노테이션을 추가했다.
    2.  `WebSocketConfig`에 의존하는 `StompChatController` 클래스에도 동일하게 `@Profile("!test")`를 추가했다.
*   **결과:**
    *   `@ActiveProfiles("test")`가 적용된 테스트 환경에서는 WebSocket 관련 설정과 컨트롤러가 아예 로드되지 않도록 원천적으로 분리했다.
    *   이를 통해 기존의 모든 REST API 테스트는 WebSocket의 영향을 받지 않고 안정적으로 실행될 수 있게 되었다.
    *   이후, 채팅 기능의 REST API 부분에 대한 테스트(`ChatApiControllerTest`)를 작성했고, 모든 테스트가 성공적으로 통과하는 것을 확인했다.

### 4. 결론 및 교훈

이번 트러블슈팅을 통해, 단순히 코드를 작성하는 것뿐만 아니라 코드가 실행되는 '환경(Environment)'과 '설정(Configuration)'의 중요성을 깊이 깨달았다.

*   `@SpringBootTest`는 실제 구동 환경과 미묘한 차이가 있으며, 특히 자동 설정(Auto-configuration)에 크게 의존하는 외부 라이브러리(WebSocket 등)를 추가할 때는 테스트 환경과의 충돌 가능성을 인지하고 **프로필 분리(`@Profile`)**를 적극적으로 고려해야 함을 배웠다.
*   원인을 알 수 없는 빌드/테스트 실패가 반복될 때는, 코드의 논리적 오류만 파고들 것이 아니라, 한 걸음 물러나 **빌드 시스템의 캐시 문제나 실행 환경 자체의 문제**를 의심하고, 환경을 완전히 초기화(`clean`, `stop` 또는 프로젝트 재구성)하는 과감한 시도가 필요함을 깨달았다.
*   가장 중요한 것은, 끈기를 가지고 다양한 가설을 세우고 검증하며, 실패 로그를 통해 꾸준히 단서를 찾아 나가는 문제 해결 과정 그 자체였다.

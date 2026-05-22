# Spring Boot와 WebSocket, STOMP로 실시간 채팅 기능 정복하기 (feat. JWT 인증)

안녕하세요! 축구/풋살 매칭 플랫폼 **PlayMatch** 프로젝트를 진행하며, 사용자 간의 실시간 소통을 위한 채팅 기능을 구현하게 되었습니다. 이번 포스팅에서는 Spring Boot 환경에서 WebSocket과 STOMP 프로토콜을 사용하여, JWT 기반 인증을 포함한 1:1 실시간 채팅 기능을 어떻게 구현했는지, 그리고 그 과정에서 겪었던 수많은 트러블슈팅 경험을 공유하고자 합니다. 🚀

> 이 글은 PlayMatch 프로젝트의 백엔드 기능 구현의 일부입니다.

### ✨ 최종 결과물

먼저 저희가 만든 채팅 기능의 최종 모습입니다. 두 명의 사용자가 각자의 브라우저에서 실시간으로 메시지를 주고받을 수 있으며, 채팅방에 다시 입장해도 이전 대화 내역이 그대로 보존됩니다.

`[채팅 기능이 동작하는 GIF나 스크린샷을 여기에 삽입하세요.]`

### 🛠️ 사용된 핵심 기술 스택

- **Spring Boot 3.x**
- **Spring Security** (JWT 인증)
- **Spring Data JPA**
- **WebSocket** & **STOMP**
- **Redis** (JWT 로그아웃 토큰 블랙리스팅용)
- **PostgreSQL**

---

### 🤔 WebSocket? STOMP? 왜 함께 사용할까?

채팅 기능을 구현하기 전에, 두 기술의 역할을 명확히 이해하는 것이 중요합니다.

- **WebSocket**: 클라이언트와 서버 간의 **실시간 양방향 통신 통로**입니다. 한번 연결이 수립되면 계속해서 데이터를 주고받을 수 있는 고속도로와 같습니다. 하지만 WebSocket 자체는 단순히 데이터 전송만 담당할 뿐, "누가 누구에게 보내는 메시지인지"와 같은 규칙은 없습니다.

- **STOMP (Simple Text Oriented Messaging Protocol)**: WebSocket 위에서 동작하는 **메시징 프로토콜**입니다. "어떤 채팅방을 구독하겠다(`/sub`)", "메시지를 발행하겠다(`/pub`)"와 같은 규칙을 정해줍니다. 덕분에 메시지에 명확한 목적지와 내용을 담아 보낼 수 있게 되죠. 고속도로 위를 달리는 버스 노선이나, 주소가 적힌 편지 시스템과 유사합니다.

> 결론: WebSocket으로 통로를 열고, STOMP로 그 위에서 체계적으로 메시지를 주고받는 구조를 선택했습니다.

---

### 💻 구현 과정 상세

#### 1. 기본 설정 (Configuration)

가장 먼저 `build.gradle`에 `websocket` 의존성을 추가하고, WebSocket과 STOMP를 활성화하는 설정 파일을 작성했습니다.

**`WebSocketConfig.java`**
```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 클라이언트가 WebSocket 연결을 시작할 엔드포인트
        registry.addEndpoint("/ws-stomp").setAllowedOriginPatterns("*").withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 메시지 구독 요청의 prefix
        registry.enableSimpleBroker("/sub");
        // 메시지 발행 요청의 prefix
        registry.setApplicationDestinationPrefixes("/pub");
    }
}
```

#### 2. JWT 인증 연동 (가장 큰 난관! 🧗‍)

HTTP API는 요청 헤더에 JWT 토큰을 담아 보내면 쉽게 인증을 처리할 수 있지만, WebSocket은 연결(Handshake) 시점에 인증을 처리해야 하는 특별한 과정이 필요했습니다.

**`StompHandler.java` (ChannelInterceptor 구현)**

`ChannelInterceptor`를 구현하여, 클라이언트가 STOMP `CONNECT` 명령을 보낼 때의 메시지를 가로채도록 했습니다. 이 핸들러의 역할은 다음과 같습니다.

1.  `CONNECT` 메시지의 헤더에서 `Authorization` 값(JWT 토큰)을 추출합니다.
2.  `JwtUtil`을 사용해 토큰의 유효성을 검증합니다.
3.  유효한 토큰이면, 토큰에서 사용자 정보를 꺼내 `Authentication` 객체를 생성합니다.
4.  생성된 `Authentication` 객체를 `SecurityContextHolder`와 **STOMP 세션**에 모두 저장합니다.

```java
@Component
@RequiredArgsConstructor
public class StompHandler implements ChannelInterceptor {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        // CONNECT 요청일 때만 인증 처리
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String bearerToken = accessor.getFirstNativeHeader(JwtUtil.AUTHORIZATION_HEADER);
            String token = jwtUtil.resolveToken(bearerToken);

            if (token != null && jwtUtil.validateToken(token)) {
                Claims info = jwtUtil.getUserInfoFromToken(token);
                UserDetails userDetails = userDetailsService.loadUserByUsername(info.getSubject());
                Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                
                // 1. Spring Security 컨텍스트에 인증 정보 저장
                SecurityContextHolder.getContext().setAuthentication(authentication);
                // 2. STOMP 세션에 인증 정보 저장 (이것이 핵심!)
                accessor.setUser(authentication);
            }
        }
        return message;
    }
}
```
> **트러블슈팅 팁!**: 처음에는 `accessor.setUser(authentication)` 코드가 없어서, `@MessageMapping` 메서드에서 사용자 정보(`Principal`)를 받지 못하는 `NullPointerException`이 계속 발생했습니다. 이 한 줄이 STOMP 세션 전체에 인증 정보를 전파하는 핵심적인 역할을 합니다.

이 핸들러를 `WebSocketConfig`에 인터셉터로 등록해주면 인증 설정이 완료됩니다.

#### 3. 컨트롤러 구현 (역할 분리)

채팅 기능은 일반적인 REST API(채팅방 생성, 과거 내역 조회)와 실시간 메시지 처리(WebSocket)가 모두 필요합니다. 이 둘을 하나의 컨트롤러에 구현했더니, `@SpringBootTest` 환경에서 심각한 충돌이 발생하여 모든 테스트가 실패하는 문제를 겪었습니다.

**해결책:** 역할을 명확히 분리했습니다.

**`ChatApiController.java`**
- `@RestController`를 사용하여, `/api/chat` 경로의 HTTP 요청(REST API)을 처리합니다.
- 채팅방 생성/조회, 내 채팅방 목록, 과거 메시지 조회 기능을 담당합니다.

**`StompChatController.java`**
- `@Controller`를 사용하여, WebSocket 클라이언트로부터 오는 STOMP 메시지만을 처리합니다.
- `@MessageMapping` 어노테이션으로 메시지 발행 경로(`/pub/chat/message`)를 지정합니다.
- 메시지를 받으면 `ChatService`에 저장 요청을 보내고, `SimpMessagingTemplate`을 이용해 해당 채팅방 구독자들에게 메시지를 브로드캐스팅합니다.

```java
// StompChatController.java
@Controller
@RequiredArgsConstructor
public class StompChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/message")
    public void sendMessage(@Payload ChatMessageRequestDto requestDto, SimpMessageHeaderAccessor headerAccessor) {
        // StompHandler에서 설정한 사용자 정보를 헤더에서 직접 꺼내 사용
        String username = headerAccessor.getUser().getName();
        
        ChatMessageResponseDto message = chatService.saveMessage(requestDto, username);
        
        // 구독자들에게 메시지 전송
        messagingTemplate.convertAndSend("/sub/chat/room/" + requestDto.getRoomId(), message);
    }
}
```

#### 4. 클라이언트 구현 (`chat.html`)

테스트를 위해 `SockJS`와 `Stomp.js` 라이브러리를 사용하여 간단한 HTML 페이지를 만들었습니다.

- **연결:** 로그인 후 받은 JWT 토큰을 헤더에 담아 `stompClient.connect()`를 호출합니다.
- **구독:** 채팅방에 입장하면 `stompClient.subscribe()`로 메시지를 받을 준비를 합니다.
- **발행:** 메시지를 입력하고 전송하면 `stompClient.send()`로 서버에 메시지를 보냅니다.

---

### ✨ 결론

실시간 채팅 기능은 여러 기술이 얽혀있어 구현이 까다로웠고, 특히 테스트 환경과의 충돌로 인해 많은 어려움을 겪었습니다. 하지만 단계적으로 문제를 분석하고, 역할을 분리하며, 인증 정보를 명확하게 전달하는 과정을 통해 안정적으로 기능을 완성할 수 있었습니다.

이번 경험을 통해 WebSocket과 STOMP의 동작 원리, 그리고 Spring Security와의 통합 방법을 깊이 있게 이해하게 되었습니다.

앞으로는 현재 단일 서버에서만 동작하는 메시지 브로커를 **Redis의 Pub/Sub 기능과 연동**하여, 서버가 여러 대로 확장되어도 모든 사용자가 끊김 없이 대화할 수 있는 구조로 고도화할 계획입니다.

긴 글 읽어주셔서 감사합니다! 🙌

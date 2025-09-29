package com.playmatch.playmatch.config;

import com.playmatch.playmatch.jwt.JwtUtil;
import com.playmatch.playmatch.security.UserDetailsServiceImpl;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class StompHandler implements ChannelInterceptor {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        log.info("STOMP Command: {}", accessor.getCommand());

        // STOMP CONNECT 요청일 때만 JWT 토큰 검증
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            // Authorization 헤더에서 토큰 추출
            String bearerToken = accessor.getFirstNativeHeader(JwtUtil.AUTHORIZATION_HEADER);
            log.info("Bearer Token from header: {}", bearerToken);

            String token = jwtUtil.resolveToken(bearerToken);
            log.info("Resolved Token: {}", token);

            if (token != null) {
                boolean isValid = jwtUtil.validateToken(token);
                log.info("Is token valid? {}", isValid);

                if (isValid) {
                    Claims info = jwtUtil.getUserInfoFromToken(token);
                    String username = info.getSubject();
                    log.info("Username from token: {}", username);

                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    accessor.setUser(authentication); // STOMP 세션에 사용자 정보 저장
                    log.info("Security context and STOMP user set for user: {}", username);
                }
            } else {
                log.error("Authorization 헤더에 유효한 토큰이 없습니다.");
            }
        }
        return message;
    }
}

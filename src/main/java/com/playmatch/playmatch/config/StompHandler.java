package com.playmatch.playmatch.config;

import com.playmatch.playmatch.jwt.JwtUtil;
import com.playmatch.playmatch.security.UserDetailsServiceImpl;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
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

import java.util.Objects;

@Profile("!test")
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

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String bearerToken = accessor.getFirstNativeHeader(JwtUtil.AUTHORIZATION_HEADER);
            log.info("Bearer Token from header: {}", bearerToken);

            String token = jwtUtil.resolveToken(bearerToken);
            log.info("Resolved Token: {}", token);

            if (token != null && jwtUtil.validateToken(token)) {
                Claims info = jwtUtil.getUserInfoFromToken(token);
                String username = info.getSubject();
                log.info("Username from token: {}", username);

                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                
                // SecurityContext와 STOMP 세션 모두에 사용자 정보 저장
                SecurityContextHolder.getContext().setAuthentication(authentication);
                accessor.setUser(authentication);
                // 세션 속성에도 저장하여 SEND, SUBSCRIBE 등에서 사용
                Objects.requireNonNull(accessor.getSessionAttributes()).put("user", authentication);
                log.info("Security context and STOMP user set for user: {}", username);
            }
        } else if (StompCommand.SEND.equals(accessor.getCommand()) || StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            // CONNECT 시점에 저장해둔 인증 정보를 SecurityContext에 다시 설정
            Authentication authentication = (Authentication) Objects.requireNonNull(accessor.getSessionAttributes()).get("user");
            if (authentication != null) {
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }
        
        return message;
    }
}
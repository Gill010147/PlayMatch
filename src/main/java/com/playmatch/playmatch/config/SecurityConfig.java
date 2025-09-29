package com.playmatch.playmatch.config;

import com.playmatch.playmatch.jwt.JwtAuthorizationFilter;
import com.playmatch.playmatch.jwt.JwtUtil;
import com.playmatch.playmatch.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService; // @Service로 등록된 것을 주입
    private final RedisTemplate<String, Object> redisTemplate;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf((csrf) -> csrf.disable());

        http.sessionManagement((sessionManagement) ->
                sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        );

        http.authorizeHttpRequests((authorizeHttprequests) ->
                authorizeHttprequests
                        .requestMatchers("/ws-stomp/**").permitAll() // WebSocket 연결 경로 허용
                        .requestMatchers("/chat.html").permitAll() // 채팅 테스트 페이지 허용
                        .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()
                        .requestMatchers("/api/**").permitAll() // 테스트를 위해 임시로 모든 api 요청 허용
                        .requestMatchers("/api/users/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/matches/**").permitAll()
                        .anyRequest().authenticated()
        );

        http.addFilterBefore(new JwtAuthorizationFilter(jwtUtil, userDetailsService, redisTemplate), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
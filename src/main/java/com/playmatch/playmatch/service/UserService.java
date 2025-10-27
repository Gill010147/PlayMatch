package com.playmatch.playmatch.service;

import com.playmatch.playmatch.domain.User;
import com.playmatch.playmatch.domain.UserRoleEnum;
import com.playmatch.playmatch.dto.LoginRequestDto;
import com.playmatch.playmatch.dto.Point;
import com.playmatch.playmatch.dto.SignUpRequestDto;
import com.playmatch.playmatch.dto.UserProfileResponseDto;
import com.playmatch.playmatch.jwt.JwtUtil;
import com.playmatch.playmatch.repository.UserRepository;
import com.playmatch.playmatch.security.UserDetailsImpl;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // Slf4j 임포트 추가
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;


@Slf4j // Slf4j 어노테이션 추가
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;
    private final KakaoApiService kakaoApiService; // KakaoApiService 주입

    @Transactional
    public void signUp(SignUpRequestDto requestDto) {
        String email = requestDto.getEmail();
        String password = passwordEncoder.encode(requestDto.getPassword());

        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        User user = User.builder()
                .email(email)
                .password(password)
                .name(requestDto.getName())
                .area(requestDto.getFullAddress()) // fullAddress를 area에 매핑
                .phone(requestDto.getPhone()) // phone 필드 추가
                .age(requestDto.getAge())
                .gender(requestDto.getGender())
                .playStyles(requestDto.getPlayStyles()) // playStyles 필드 추가
                .positions(requestDto.getPositions()) // positions 필드 추가
                .skills(requestDto.getSkills()) // skills 필드 추가
                .role(UserRoleEnum.USER) // 기본 권한을 USER로 설정
                .build();

        // 주소로 좌표를 얻어와서 User에 설정
        if (requestDto.getFullAddress() != null && !requestDto.getFullAddress().isBlank()) {
            Point coordinates = kakaoApiService.getCoordinates(requestDto.getFullAddress());
            user.setLatitude(coordinates.getLatitude());
            user.setLongitude(coordinates.getLongitude());
        }

        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public String logIn(LoginRequestDto requestDto) {
        User user = userRepository.findByEmail(requestDto.getEmail()).orElseThrow(
                () -> new IllegalArgumentException("등록되지 않은 이메일입니다.")
        );

        if (!passwordEncoder.matches(requestDto.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        return jwtUtil.createToken(user.getEmail(), user.getRole());
    }

    @Transactional(readOnly = true)
    public UserProfileResponseDto getUserProfile(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new IllegalArgumentException("사용자를 찾을 수 없습니다.")
        );
        return new UserProfileResponseDto(user);
    }

    public void logout(HttpServletRequest request) {
        String token = jwtUtil.getJwtFromHeader(request);
        if (!StringUtils.hasText(token)) {
            return;
        }

        Claims claims = jwtUtil.getUserInfoFromToken(token);
        Date expiration = claims.getExpiration();
        long now = new Date().getTime();
        long remainingMillis = expiration.getTime() - now;

        if (remainingMillis > 0) {
            redisTemplate.opsForValue().set("blacklist:" + token, "logout", remainingMillis, TimeUnit.MILLISECONDS);
        }
    }
}
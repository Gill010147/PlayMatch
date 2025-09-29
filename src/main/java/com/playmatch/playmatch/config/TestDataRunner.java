package com.playmatch.playmatch.config;

import com.playmatch.playmatch.domain.UserRoleEnum;
import com.playmatch.playmatch.dto.SignUpRequestDto;
import com.playmatch.playmatch.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("!test") // 테스트 환경에서는 실행되지 않도록 설정
@RequiredArgsConstructor
public class TestDataRunner {

    private final UserService userService;

    @Bean
    public CommandLineRunner run() {
        return args -> {
            try {
                // 테스트용 사용자 1 생성
                SignUpRequestDto user1Dto = new SignUpRequestDto();
                user1Dto.setEmail("user1@test.com");
                user1Dto.setPassword("password");
                user1Dto.setName("유저1");
                user1Dto.setRole(UserRoleEnum.USER);
                userService.signUp(user1Dto);
            } catch (IllegalArgumentException e) {
                // 이미 사용자가 존재하면 무시
            }

            try {
                // 테스트용 사용자 2 생성
                SignUpRequestDto user2Dto = new SignUpRequestDto();
                user2Dto.setEmail("user2@test.com");
                user2Dto.setPassword("password");
                user2Dto.setName("유저2");
                user2Dto.setRole(UserRoleEnum.USER);
                userService.signUp(user2Dto);
            } catch (IllegalArgumentException e) {
                // 이미 사용자가 존재하면 무시
            }
        };
    }
}

package com.playmatch.playmatch.config;

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
                userService.signUp(user2Dto);
            } catch (IllegalArgumentException e) {
                // 이미 사용자가 존재하면 무시
            }
        };
    }
}
");
                user2Dto.setName("유저2");
                userService.signUp(user2Dto);
            } catch (IllegalArgumentException e) {
                // 이미 사용자가 존재하면 무시
            }

            // 경기 생성 테스트용 사용자 및 팀 생성
            try {
                User testUser = userRepository.findByEmail("test1@naver.com").orElseGet(() -> {
                    SignUpRequestDto signUpDto = new SignUpRequestDto();
                    signUpDto.setEmail("test1@naver.com");
                    signUpDto.setPassword("password");
                    signUpDto.setName("테스트유저");
                    // 추가 정보 설정
                    signUpDto.setGender("MALE");
                    signUpDto.setAge("25");
                    signUpDto.setPhone("01012345678");
                    signUpDto.setFullAddress("서울시 강남구");
                    userService.signUp(signUpDto);
                    return userRepository.findByEmail("test1@naver.com").get();
                });

                // ID가 1인 팀이 없는 경우에만 생성
                if (teamRepository.findById(1).isEmpty()) {
                    TeamRequestDto teamDto = new TeamRequestDto();
                    teamDto.setName("테스트팀");
                    teamDto.setIntroduce("테스트를 위한 팀입니다.");
                    teamDto.setMainArea("서울");
                    teamService.createTeam(teamDto, null, testUser.getEmail());
                }
            } catch (Exception e) {
                // 테스트 데이터 생성 중 오류 발생 시 로그 출력
                System.err.println("테스트 데이터 생성 중 오류 발생: " + e.getMessage());
            }
        };
    }
}

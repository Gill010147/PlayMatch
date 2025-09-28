package com.playmatch.playmatch.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.playmatch.playmatch.domain.User;
import com.playmatch.playmatch.domain.UserRoleEnum;
import com.playmatch.playmatch.dto.LoginRequestDto;
import com.playmatch.playmatch.dto.SignUpRequestDto;
import com.playmatch.playmatch.jwt.JwtUtil;
import com.playmatch.playmatch.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("회원가입 성공")
    void register_Success() throws Exception {
        // given
        SignUpRequestDto requestDto = new SignUpRequestDto();
        requestDto.setEmail("test@test.com");
        requestDto.setPassword("password");
        requestDto.setName("테스트");
        requestDto.setRole(UserRoleEnum.USER);

        String requestBody = objectMapper.writeValueAsString(requestDto);

        // when & then
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(content().string("회원가입이 완료되었습니다."));

        User savedUser = userRepository.findByEmail("test@test.com").orElseThrow();
        assertThat(savedUser).isNotNull();
        assertThat(savedUser.getName()).isEqualTo("테스트");
    }

    @Test
    @DisplayName("회원가입 실패 - 중복된 이메일")
    void register_Fail_DuplicateEmail() throws Exception {
        // given
        User existingUser = User.builder()
                .email("test@test.com")
                .password("password")
                .name("기존유저")
                .role(UserRoleEnum.USER)
                .build();
        userRepository.save(existingUser);

        SignUpRequestDto requestDto = new SignUpRequestDto();
        requestDto.setEmail("test@test.com");
        requestDto.setPassword("password");
        requestDto.setName("새로운유저");
        requestDto.setRole(UserRoleEnum.USER);

        String requestBody = objectMapper.writeValueAsString(requestDto);

        // when & then
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("로그인 성공")
    void login_Success() throws Exception {
        // given
        User user = User.builder()
                .email("test@test.com")
                .password(passwordEncoder.encode("password"))
                .name("테스트유저")
                .role(UserRoleEnum.USER)
                .build();
        userRepository.save(user);

        LoginRequestDto requestDto = new LoginRequestDto();
        requestDto.setEmail("test@test.com");
        requestDto.setPassword("password");

        String requestBody = objectMapper.writeValueAsString(requestDto);

        // when & then
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(header().exists(JwtUtil.AUTHORIZATION_HEADER))
                .andExpect(header().string(JwtUtil.AUTHORIZATION_HEADER, org.hamcrest.Matchers.startsWith(JwtUtil.BEARER_PREFIX)));
    }

    @Test
    @DisplayName("로그인 실패 - 잘못된 비밀번호")
    void login_Fail_WrongPassword() throws Exception {
        // given
        User user = User.builder()
                .email("test@test.com")
                .password(passwordEncoder.encode("password"))
                .name("테스트유저")
                .role(UserRoleEnum.USER)
                .build();
        userRepository.save(user);

        LoginRequestDto requestDto = new LoginRequestDto();
        requestDto.setEmail("test@test.com");
        requestDto.setPassword("wrongpassword");

        String requestBody = objectMapper.writeValueAsString(requestDto);

        // when & then
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("로그아웃 성공")
    void logout_Success() throws Exception {
        // given: A user is created and logged in to get a token
        User user = User.builder()
                .email("logout@test.com")
                .password(passwordEncoder.encode("password"))
                .name("로그아웃유저")
                .role(UserRoleEnum.USER)
                .build();
        userRepository.save(user);

        LoginRequestDto loginDto = new LoginRequestDto();
        loginDto.setEmail("logout@test.com");
        loginDto.setPassword("password");

        String loginBody = objectMapper.writeValueAsString(loginDto);

        String token = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isOk())
                .andReturn().getResponse().getHeader(JwtUtil.AUTHORIZATION_HEADER);

        // when: The user logs out with the token
        mockMvc.perform(post("/api/auth/logout")
                        .header(JwtUtil.AUTHORIZATION_HEADER, token))
                .andExpect(status().isOk())
                .andExpect(content().string("로그아웃 되었습니다."));

        // then: The token is no longer valid for accessing protected endpoints
        mockMvc.perform(get("/api/users/me")
                        .header(JwtUtil.AUTHORIZATION_HEADER, token))
                .andExpect(status().isForbidden()); // or isUnauthorized(), depending on config
    }
}

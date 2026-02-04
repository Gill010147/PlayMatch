package com.playmatch.playmatch.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SignUpRequestDto {
    private String email;
    private String password;
    private String name;
    private String age; // 나이 추가
    private String gender; // 성별 추가
    private List<String> playStyles; // 플레이 스타일 리스트로 변경
    private List<String> positions; // 포지션 리스트로 변경
    private List<String> skills; // 스킬 리스트 추가
    private String phone; // 전화번호 추가
    private String fullAddress; // 전체 주소 추가 (User 엔티티의 area에 매핑)
}
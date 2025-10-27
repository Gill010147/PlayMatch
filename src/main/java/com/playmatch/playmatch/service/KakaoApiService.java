package com.playmatch.playmatch.service;

import com.playmatch.playmatch.dto.Point;
import org.springframework.stereotype.Service;

@Service
public class KakaoApiService {

    // TODO: Implement actual Kakao API call with RestTemplate or WebClient
    public Point getCoordinates(String address) {
        System.out.println("[MOCK] KakaoApiService: Converting address '" + address + "' to coordinates.");

        if (address.contains("서울")) {
            System.out.println("[MOCK] Detected '서울', returning Seoul coordinates.");
            return new Point(37.5665, 126.9780); // Seoul City Hall
        } else if (address.contains("충주")) {
            System.out.println("[MOCK] Detected '충주', returning Chungju coordinates.");
            return new Point(36.9919, 127.9263); // Chungju City Hall
        } else if (address.contains("부산")) {
            System.out.println("[MOCK] Detected '부산', returning Busan coordinates.");
            return new Point(35.1796, 129.0756); // Busan City Hall
        } else {
            System.out.println("[MOCK] No specific city detected, returning default (Seoul) coordinates.");
            return new Point(37.5665, 126.9780); // Default to Seoul
        }
    }
}

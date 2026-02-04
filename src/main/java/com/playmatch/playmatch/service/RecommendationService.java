package com.playmatch.playmatch.service;

import com.playmatch.playmatch.domain.User;
import com.playmatch.playmatch.dto.RecommendationRequestDto;
import com.playmatch.playmatch.dto.RecommendedPlayerDto;
import com.playmatch.playmatch.dto.Point;
import com.playmatch.playmatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final UserRepository userRepository;

    // 가중치 상수
    private static final int POSITION_WEIGHT = 10;
    private static final int PLAYSTYLE_WEIGHT = 5;
    private static final int SKILL_WEIGHT = 3;
    private static final int DISTANCE_TIER_1_WEIGHT = 20; // 5km 이내
    private static final int DISTANCE_TIER_2_WEIGHT = 10; // 15km 이내
    private static final int DISTANCE_TIER_3_WEIGHT = 5;  // 30km 이내

    private static final double EARTH_RADIUS_KM = 6371;

    @Transactional(readOnly = true)
    public List<RecommendedPlayerDto> recommendPlayers(RecommendationRequestDto requestDto, Point coordinates) {
        List<User> allUsers = userRepository.findAll();

        return allUsers.stream()
                .map(user -> {
                    int score = calculateMatchScore(user, requestDto, coordinates);
                    return new RecommendedPlayerDto(user, score);
                })
                .filter(dto -> dto.getScore() > 0) // 점수가 0보다 큰 선수만 추천
                .sorted((dto1, dto2) -> Integer.compare(dto2.getScore(), dto1.getScore())) // 점수 내림차순 정렬
                .collect(Collectors.toList());
    }

    private int calculateMatchScore(User user, RecommendationRequestDto criteria, Point coordinates) {
        int score = 0;

        // 1. 포지션 점수 계산
        if (criteria.getPosition() != null && user.getPositions() != null && user.getPositions().contains(criteria.getPosition())) {
            score += POSITION_WEIGHT;
        }

        // 2. 플레이 스타일 점수 계산
        if (criteria.getPlayStyles() != null && user.getPlayStyles() != null) {
            long matchingStyles = user.getPlayStyles().stream()
                    .filter(style -> criteria.getPlayStyles().contains(style))
                    .count();
            score += matchingStyles * PLAYSTYLE_WEIGHT;
        }

        // 3. 스킬 점수 계산
        if (criteria.getSkills() != null && user.getSkills() != null) {
            long matchingSkills = user.getSkills().stream()
                    .filter(skill -> criteria.getSkills().contains(skill))
                    .count();
            score += matchingSkills * SKILL_WEIGHT;
        }

        // 4. 거리 점수 계산
        if (coordinates != null && user.getLatitude() != null && user.getLongitude() != null) {
            double distance = calculateDistance(coordinates.getLatitude(), coordinates.getLongitude(), user.getLatitude(), user.getLongitude());
            if (distance < 5) {
                score += DISTANCE_TIER_1_WEIGHT;
            } else if (distance < 15) {
                score += DISTANCE_TIER_2_WEIGHT;
            } else if (distance < 30) {
                score += DISTANCE_TIER_3_WEIGHT;
            }
        }

        return score;
    }

    /**
     * 두 지점 간의 거리를 하버사인 공식을 이용해 km 단위로 계산합니다.
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }
}

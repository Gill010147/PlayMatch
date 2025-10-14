package com.playmatch.playmatch.service;

import com.playmatch.playmatch.domain.User;
import com.playmatch.playmatch.dto.CriteriaDTO;
import com.playmatch.playmatch.dto.ScoredPlayerDTO;
import com.playmatch.playmatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    // 가중치 상수 정의
    private static final int POSITION_MATCH_WEIGHT = 10;
    private static final int STYLE_MATCH_WEIGHT = 5;
    private static final int SKILL_MATCH_WEIGHT = 3;

    // DB에서 선수 정보를 가져오기 위한 Repository
    private final UserRepository userRepository;

    public List<ScoredPlayerDTO> getRecommendedPlayers(CriteriaDTO criteria, Long currentUserId) {
        // 1. DB에서 모든 선수 목록을 가져옵니다.
        List<User> allPlayers = userRepository.findAll();

        // 2. 자기 자신을 추천 목록에서 제외합니다.
        List<User> filteredPlayers = allPlayers.stream()
                .filter(user -> !user.getId().equals(currentUserId.intValue())) // Long을 Integer로 변환하여 비교
                .collect(Collectors.toList());

        // 3. 최대 점수 계산 (100점 만점 스케일링을 위한 기준)
        int maxPossibleScore = 0;
        if (criteria.getPosition() != null) {
            maxPossibleScore += POSITION_MATCH_WEIGHT;
        }
        if (criteria.getPlayStyles() != null) {
            maxPossibleScore += criteria.getPlayStyles().size() * STYLE_MATCH_WEIGHT;
        }
        if (criteria.getSkills() != null) {
            maxPossibleScore += criteria.getSkills().size() * SKILL_MATCH_WEIGHT;
        }

        // Lambda 내부에서 안전하게 사용하기 위해 final 변수로 복사
        final int maxScore = maxPossibleScore;

        // 4. 각 선수의 점수를 계산하고, 100점 만점으로 스케일링한 후 정렬합니다.
        return filteredPlayers.stream()
                .map(player -> {
                    int score = 0;

                    // 포지션 점수 계산
                    if (criteria.getPosition() != null && player.getPositions() != null &&
                        player.getPositions().contains(criteria.getPosition())) {
                        score += POSITION_MATCH_WEIGHT;
                    }

                    // 플레이 스타일 점수 계산
                    if (criteria.getPlayStyles() != null) {
                        for (String style : criteria.getPlayStyles()) {
                            if (player.getPlayStyles() != null && player.getPlayStyles().contains(style)) {
                                score += STYLE_MATCH_WEIGHT;
                            }
                        }
                    }

                    // 능력 점수 계산
                    if (criteria.getSkills() != null) {
                        for (String skill : criteria.getSkills()) {
                            if (player.getSkills() != null && player.getSkills().contains(skill)) {
                                score += SKILL_MATCH_WEIGHT;
                            }
                        }
                    }

                    // 획득 점수를 100점 만점으로 스케일링
                    int scaledScore = 0;
                    if (maxScore > 0) {
                        scaledScore = (int) Math.round(((double) score / maxScore) * 100);
                    } else if (score > 0) {
                        scaledScore = 100;
                    }

                    return new ScoredPlayerDTO(player, scaledScore);
                })
                // 5. 점수가 높은 순으로 정렬합니다.
                .sorted(Comparator.comparingInt(ScoredPlayerDTO::getScore).reversed())
                // 6. 결과를 List 형태로 변환합니다.
                .collect(Collectors.toList());
    }
}

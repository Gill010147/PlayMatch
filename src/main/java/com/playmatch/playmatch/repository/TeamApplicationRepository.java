package com.playmatch.playmatch.repository;

import com.playmatch.playmatch.domain.Team;
import com.playmatch.playmatch.domain.TeamApplication;
import com.playmatch.playmatch.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TeamApplicationRepository extends JpaRepository<TeamApplication, Long> {

    /**
     * 특정 팀과 사용자에 대한 지원서가 존재하는지 확인합니다.
     * @param team 대상 팀
     * @param user 지원자
     * @return 지원서 존재 여부
     */
    boolean existsByTeamAndUser(Team team, User user);

    /**
     * 특정 팀의 모든 지원서 목록을 조회합니다.
     * @param team 대상 팀
     * @return 해당 팀의 지원서 목록
     */
    List<TeamApplication> findAllByTeam(Team team);
}

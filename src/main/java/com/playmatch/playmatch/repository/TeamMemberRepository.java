package com.playmatch.playmatch.repository;

import com.playmatch.playmatch.domain.Team;
import com.playmatch.playmatch.domain.TeamMember;
import com.playmatch.playmatch.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    boolean existsByTeamAndUser(Team team, User user);
    List<TeamMember> findAllByUser(User user);
}

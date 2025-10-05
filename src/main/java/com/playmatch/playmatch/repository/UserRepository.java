package com.playmatch.playmatch.repository;

import com.playmatch.playmatch.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.teamMemberships tm LEFT JOIN FETCH tm.team WHERE u.email = :email")
    Optional<User> findByEmailWithTeamMemberships(@Param("email") String email);

    Optional<User> findByEmail(String email);
}

package com.playmatch.playmatch.repository;

import com.playmatch.playmatch.domain.Facility;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FacilityRepository extends JpaRepository<Facility, Long> {
}
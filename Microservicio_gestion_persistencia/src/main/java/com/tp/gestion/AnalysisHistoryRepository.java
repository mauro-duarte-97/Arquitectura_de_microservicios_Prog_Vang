package com.tp.gestion;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AnalysisHistoryRepository extends JpaRepository<AnalysisHistory, UUID> {

    Page<AnalysisHistory> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    Optional<AnalysisHistory> findByIdAndUser(UUID id, User user);
}

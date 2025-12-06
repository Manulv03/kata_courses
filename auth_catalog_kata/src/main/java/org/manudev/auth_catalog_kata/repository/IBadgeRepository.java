package org.manudev.auth_catalog_kata.repository;

import org.manudev.auth_catalog_kata.entities.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IBadgeRepository extends JpaRepository<Badge, Long> {
}

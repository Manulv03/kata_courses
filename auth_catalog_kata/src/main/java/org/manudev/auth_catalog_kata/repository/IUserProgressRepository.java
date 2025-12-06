package org.manudev.auth_catalog_kata.repository;

import org.manudev.auth_catalog_kata.entities.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IUserProgressRepository extends JpaRepository<UserProgress, Long> {
}

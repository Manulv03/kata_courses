package org.manudev.auth_catalog_kata.repository;

import org.manudev.auth_catalog_kata.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IUsersRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}

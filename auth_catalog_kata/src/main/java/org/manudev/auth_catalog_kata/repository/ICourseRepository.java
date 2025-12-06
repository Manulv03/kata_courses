package org.manudev.auth_catalog_kata.repository;

import org.manudev.auth_catalog_kata.entities.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ICourseRepository extends JpaRepository<Course, Long> {
}

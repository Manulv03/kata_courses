package org.manudev.auth_catalog_kata.repository;

import org.manudev.auth_catalog_kata.entities.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ICourseRepository extends JpaRepository<Course, Long> {

    @Query(value = "SELECT DISTINCT module FROM courses", nativeQuery = true)
    List<String> findDistinctModulesNative();

    Page<Course> findByModuleContainingIgnoreCase(String module, Pageable pageable);

    boolean deleteCourseById(Long id);
}

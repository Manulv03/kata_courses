package org.manudev.auth_catalog_kata.services.interfaces;


import org.manudev.auth_catalog_kata.dto.CourseRequestDTO;
import org.manudev.auth_catalog_kata.dto.CourseRequestPageableDTO;
import org.manudev.auth_catalog_kata.dto.CourseResponseDTO;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ICoursesService {
    List<String> getAvailableModules();

    Page<CourseResponseDTO> listCourses(CourseRequestPageableDTO request);

    CourseResponseDTO getCourseById(Long id);

    CourseResponseDTO createCourse(CourseRequestDTO request);

    boolean deleteCourseById(Long id);

    CourseResponseDTO updateCourseById(Long id, CourseRequestDTO request);
}

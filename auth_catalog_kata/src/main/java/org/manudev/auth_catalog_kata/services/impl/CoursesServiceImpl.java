package org.manudev.auth_catalog_kata.services.impl;

import org.manudev.auth_catalog_kata.dto.CourseRequestDTO;
import org.manudev.auth_catalog_kata.entities.Course;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import lombok.NonNull;
import org.manudev.auth_catalog_kata.dto.CourseRequestPageableDTO;
import org.manudev.auth_catalog_kata.dto.CourseResponseDTO;
import org.manudev.auth_catalog_kata.repository.ICourseRepository;
import org.manudev.auth_catalog_kata.services.interfaces.ICoursesService;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
public class CoursesServiceImpl implements ICoursesService {

    public CoursesServiceImpl(ICourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    private final ICourseRepository courseRepository;

    @Override
    public List<String> getAvailableModules() {
        List<String> availableModules = courseRepository.findDistinctModulesNative();
        return availableModules.isEmpty() ? Collections.emptyList() : availableModules.stream().sorted().toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<@NonNull CourseResponseDTO> listCourses(CourseRequestPageableDTO request) {

        var pageable = request.toPageable();
        Page<Course> page;
        if (request.module() != null && !request.module().isBlank()) {
            page = courseRepository.findByModuleContainingIgnoreCase(request.module().trim(), pageable);
        } else {
            page = courseRepository.findAll(pageable);
        }

        return page.map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public CourseResponseDTO getCourseById(Long id) {
        return toDto(courseRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found with id: " + id))
        );
    }

    @Override
    @Transactional
    public CourseResponseDTO createCourse(CourseRequestDTO request) {

        Course course = Course.builder()
                .title(request.title())
                .description(request.description())
                .module(request.module())
                .durationHours(request.duration())
                .badgeImage(request.image())
                .build();
        Course createdCourse = courseRepository.save(course);

        return toDto(createdCourse);
    }

    @Override
    public boolean deleteCourseById(Long id) {
        return courseRepository.deleteCourseById(id);
    }

    @Override
    public CourseResponseDTO updateCourseById(Long id, CourseRequestDTO request) {

        Course course = courseRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found with id: " + id)
        );

        if (request.description() != null) {
            course.setDescription(request.description());
        }
        if (request.module() != null) {
            course.setModule(request.module());
        }
        if (request.duration() != null) {
            course.setDurationHours(request.duration());
        }
        if (request.image() != null) {
            course.setBadgeImage(request.image());
        }

        course.setUpdatedAt(LocalDateTime.now());

        Course saved = courseRepository.save(course);

        return toDto(saved);
    }


    private CourseResponseDTO toDto(Course c) {
        return new CourseResponseDTO(
                c.getId(),
                c.getTitle(),
                c.getDescription(),
                c.getModule(),
                c.getDurationHours(),
                c.getBadgeImage(),
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }
}

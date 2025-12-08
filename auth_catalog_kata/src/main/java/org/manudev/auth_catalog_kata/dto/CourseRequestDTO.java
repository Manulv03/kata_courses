package org.manudev.auth_catalog_kata.dto;

public record CourseRequestDTO(
        String title,
        String description,
        String module,
        String duration,
        String image
) {
}

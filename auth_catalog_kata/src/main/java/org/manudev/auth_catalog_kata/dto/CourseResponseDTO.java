package org.manudev.auth_catalog_kata.dto;

import java.time.LocalDateTime;

public record CourseResponseDTO (
        Long id,
        String title,
        String description,
        String module,
        String durationHours,
        String badgeImage,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
){
}

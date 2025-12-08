package org.manudev.auth_catalog_kata.dto;

import jakarta.annotation.Nullable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

public record CourseRequestPageableDTO(@Nullable String module, Integer page, Integer size) {

    public Pageable toPageable() {
        int p = page == null || page < 0 ? 0 : page;
        int s = size == null || size <= 0 ? 20 : size;
        return PageRequest.of(p, s);
    }
}

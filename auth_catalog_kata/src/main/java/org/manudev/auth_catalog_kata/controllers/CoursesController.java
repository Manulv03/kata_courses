package org.manudev.auth_catalog_kata.controllers;

import lombok.NonNull;
import org.manudev.auth_catalog_kata.dto.CourseRequestDTO;
import org.manudev.auth_catalog_kata.dto.CourseRequestPageableDTO;
import org.manudev.auth_catalog_kata.dto.CourseResponseDTO;
import org.manudev.auth_catalog_kata.services.interfaces.ICoursesService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses")
public class CoursesController {

    public CoursesController(ICoursesService coursesService) {
        this.coursesService = coursesService;
    }

    private ICoursesService coursesService;

    /**
     * Lista cursos con paginación.
     * Query params:
     *  - module (opcional): filtro por módulo
     *  - page (opcional): número de página (0-based)
     *  - size (opcional): tamaño de página
     */

    @GetMapping
    public ResponseEntity<@NonNull Page<CourseResponseDTO>> listCourses(
            @RequestParam(required = false) String module,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        CourseRequestPageableDTO req = new CourseRequestPageableDTO(module, page, size);
        Page<CourseResponseDTO> result = coursesService.listCourses(req);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/modules")
    public ResponseEntity<@NonNull List<String>> getModules() {
        return new ResponseEntity<>(coursesService.getAvailableModules() ,HttpStatus.OK);
    }

    /**
     * Obtener un curso por id
     */

    @GetMapping("/{id}")
    public ResponseEntity<@NonNull CourseResponseDTO> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(coursesService.getCourseById(id));
    }

    /**
     * Crear un curso
     */

    @PostMapping("/create")
    public ResponseEntity<CourseResponseDTO> createCourse(@RequestBody CourseRequestDTO courseRequestDTO) {

        return ResponseEntity.ok(coursesService.createCourse(courseRequestDTO));
    }

    /**
     * Eliminar un curso por id
     */

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<CourseResponseDTO> deleteCourseById(@PathVariable Long id) {
        return coursesService.deleteCourseById(id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    /**
     * Actualizar un curso según su id, si algunos datos vienen vacíos, no se actualizan
     */
    @PutMapping("/update/{id}")
    public ResponseEntity<CourseResponseDTO> updateCourse(@PathVariable Long id, @RequestBody CourseRequestDTO courseRequestDTO) {
        return ResponseEntity.ok(coursesService.updateCourseById(id, courseRequestDTO));
    }

}

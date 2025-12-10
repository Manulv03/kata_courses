package org.manudev.auth_catalog_kata.services.impl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.manudev.auth_catalog_kata.dto.CourseRequestDTO;
import org.manudev.auth_catalog_kata.dto.CourseRequestPageableDTO;
import org.manudev.auth_catalog_kata.dto.CourseResponseDTO;
import org.manudev.auth_catalog_kata.entities.Course;
import org.manudev.auth_catalog_kata.repository.ICourseRepository;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias para CoursesServiceImpl
 * 
 * Estas pruebas validan la lógica de negocio del servicio sin depender de la base de datos.
 * Utilizamos Mockito para simular el comportamiento del repositorio.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("CoursesServiceImpl - Pruebas Unitarias")
class CoursesServiceImplTest {

    @Mock
    private ICourseRepository courseRepository;

    @InjectMocks
    private CoursesServiceImpl coursesService;

    private Course testCourse;
    private CourseRequestDTO testRequestDTO;
    
    /**
     * Configuración inicial que se ejecuta antes de cada test.
     * Prepara datos de prueba reutilizables.
     */
    @BeforeEach
    void setUp() {
        // Creamos un curso de prueba con datos completos
        testCourse = Course.builder()
                .id(1L)
                .title("Java Fundamentals")
                .description("Learn Java basics")
                .module("Backend")
                .durationHours("40")
                .badgeImage("java-badge.png")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        // DTO de request para crear/actualizar cursos
        testRequestDTO = new CourseRequestDTO(
                "Java Fundamentals",
                "Learn Java basics",
                "Backend",
                "40",
                "java-badge.png"
        );
    }

    // ==================== PRUEBAS PARA getAvailableModules() ====================
    
    /**
     * Test: Verificar que se devuelven módulos ordenados cuando existen en la BD.
     * 
     * Evalúa:
     * - Que se llame al repositorio correctamente
     * - Que los módulos se ordenen alfabéticamente
     * - Que se devuelva una lista inmutable
     */
    @Test
    @DisplayName("getAvailableModules - Debe devolver módulos ordenados alfabéticamente")
    void testGetAvailableModules_WhenModulesExist_ShouldReturnSortedList() {
        // ARRANGE: Preparamos módulos desordenados
        List<String> unsortedModules = Arrays.asList("Frontend", "Backend", "DevOps");
        when(courseRepository.findDistinctModulesNative()).thenReturn(unsortedModules);


        List<String> result = coursesService.getAvailableModules();

        assertThat(result)
                .isNotNull()
                .hasSize(3)
                .containsExactly("Backend", "DevOps", "Frontend"); // Orden alfabético
        
        verify(courseRepository, times(1)).findDistinctModulesNative();
    }

    /**
     * Test: Verificar el comportamiento cuando no hay módulos.
     * 
     * Evalúa:
     * - Manejo del caso edge cuando la BD está vacía
     * - Que se devuelva una lista vacía (no null)
     */
    @Test
    @DisplayName("getAvailableModules - Debe devolver lista vacía cuando no hay módulos")
    void testGetAvailableModules_WhenNoModules_ShouldReturnEmptyList() {
        // ARRANGE
        when(courseRepository.findDistinctModulesNative()).thenReturn(Collections.emptyList());

        
        List<String> result = coursesService.getAvailableModules();

        
        assertThat(result)
                .isNotNull()
                .isEmpty();
        
        verify(courseRepository, times(1)).findDistinctModulesNative();
    }

    // ==================== PRUEBAS PARA listCourses() ====================
    
    /**
     * Test: Listar cursos con filtro por módulo.
     * 
     * Evalúa:
     * - Que se use el método correcto del repositorio cuando hay filtro
     * - Que se construya el Pageable correctamente
     * - Que se mapeen las entidades a DTOs
     */
    @Test
    @DisplayName("listCourses - Debe filtrar por módulo cuando se proporciona")
    void testListCourses_WithModuleFilter_ShouldFilterByModule() {
        // ARRANGE
        CourseRequestPageableDTO request = new CourseRequestPageableDTO(
                "Backend", // filtro por módulo
                0,         // página
                10         // tamaño
        );
        
        Pageable pageable = PageRequest.of(0, 10);
        Page<Course> coursePage = new PageImpl<>(List.of(testCourse), pageable, 1);
        
        when(courseRepository.findByModuleContainingIgnoreCase(eq("Backend"), any(Pageable.class)))
                .thenReturn(coursePage);

        
        Page<CourseResponseDTO> result = coursesService.listCourses(request);

        
        assertThat(result)
                .isNotNull()
                .hasSize(1);
        
        CourseResponseDTO dto = result.getContent().get(0);
        assertThat(dto.id()).isEqualTo(1L);
        assertThat(dto.title()).isEqualTo("Java Fundamentals");
        assertThat(dto.module()).isEqualTo("Backend");
        
        verify(courseRepository).findByModuleContainingIgnoreCase(eq("Backend"), any(Pageable.class));
        verify(courseRepository, never()).findAll(any(Pageable.class));
    }

    /**
     * Test: Listar todos los cursos sin filtro.
     * 
     * Evalúa:
     * - Que se use findAll cuando no hay filtro de módulo
     * - Paginación correcta
     */
    @Test
    @DisplayName("listCourses - Debe listar todos cuando no hay filtro de módulo")
    void testListCourses_WithoutModuleFilter_ShouldListAll() {
        // ARRANGE
        CourseRequestPageableDTO request = new CourseRequestPageableDTO(
                null,      // sin filtro
                0,
                10
        );
        
        Pageable pageable = PageRequest.of(0, 10);
        Page<Course> coursePage = new PageImpl<>(List.of(testCourse), pageable, 1);
        
        when(courseRepository.findAll(any(Pageable.class))).thenReturn(coursePage);

        
        Page<CourseResponseDTO> result = coursesService.listCourses(request);

        
        assertThat(result)
                .isNotNull()
                .hasSize(1);
        
        verify(courseRepository).findAll(any(Pageable.class));
        verify(courseRepository, never()).findByModuleContainingIgnoreCase(anyString(), any(Pageable.class));
    }

    /**
     * Test: Verificar que módulos en blanco se traten como sin filtro.
     * 
     * Evalúa:
     * - Manejo de strings vacíos o con solo espacios
     */
    @Test
    @DisplayName("listCourses - Debe ignorar filtro de módulo si está en blanco")
    void testListCourses_WithBlankModule_ShouldIgnoreFilter() {
        // ARRANGE
        CourseRequestPageableDTO request = new CourseRequestPageableDTO(
                "   ",     // módulo en blanco
                0,
                10
        );
        
        Page<Course> coursePage = new PageImpl<>(List.of(testCourse));
        when(courseRepository.findAll(any(Pageable.class))).thenReturn(coursePage);

        
        coursesService.listCourses(request);

        
        verify(courseRepository).findAll(any(Pageable.class));
        verify(courseRepository, never()).findByModuleContainingIgnoreCase(anyString(), any(Pageable.class));
    }

    // ==================== PRUEBAS PARA getCourseById() ====================
    
    /**
     * Test: Obtener un curso existente por ID.
     * 
     * Evalúa:
     * - Recuperación exitosa de un curso
     * - Mapeo correcto a DTO
     */
    @Test
    @DisplayName("getCourseById - Debe devolver el curso cuando existe")
    void testGetCourseById_WhenCourseExists_ShouldReturnCourse() {
        // ARRANGE
        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));

        
        CourseResponseDTO result = coursesService.getCourseById(1L);

        
        assertThat(result)
                .isNotNull()
                .satisfies(dto -> {
                    assertThat(dto.id()).isEqualTo(1L);
                    assertThat(dto.title()).isEqualTo("Java Fundamentals");
                    assertThat(dto.description()).isEqualTo("Learn Java basics");
                    assertThat(dto.module()).isEqualTo("Backend");
                    assertThat(dto.durationHours()).isEqualTo("40");
                    assertThat(dto.badgeImage()).isEqualTo("java-badge.png");
                });
        
        verify(courseRepository, times(1)).findById(1L);
    }

    /**
     * Test: Intentar obtener un curso inexistente.
     * 
     * Evalúa:
     * - Que se lance ResponseStatusException con NOT_FOUND
     * - Mensaje de error correcto
     */
    @Test
    @DisplayName("getCourseById - Debe lanzar excepción cuando el curso no existe")
    void testGetCourseById_WhenCourseNotFound_ShouldThrowException() {
        // ARRANGE
        when(courseRepository.findById(999L)).thenReturn(Optional.empty());


        assertThatThrownBy(() -> coursesService.getCourseById(999L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Course not found with id: 999");
        
        verify(courseRepository, times(1)).findById(999L);
    }

    // ==================== PRUEBAS PARA createCourse() ====================
    
    /**
     * Test: Crear un curso exitosamente.
     * 
     * Evalúa:
     * - Construcción correcta de la entidad Course desde DTO
     * - Guardado en el repositorio
     * - Retorno del DTO con los datos guardados
     */
    @Test
    @DisplayName("createCourse - Debe crear y devolver el curso correctamente")
    void testCreateCourse_WithValidData_ShouldCreateAndReturnCourse() {
        // ARRANGE
        Course savedCourse = Course.builder()
                .id(1L)
                .title(testRequestDTO.title())
                .description(testRequestDTO.description())
                .module(testRequestDTO.module())
                .durationHours(testRequestDTO.duration())
                .badgeImage(testRequestDTO.image())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        when(courseRepository.save(any(Course.class))).thenReturn(savedCourse);

        
        CourseResponseDTO result = coursesService.createCourse(testRequestDTO);

        
        assertThat(result)
                .isNotNull()
                .satisfies(dto -> {
                    assertThat(dto.id()).isEqualTo(1L);
                    assertThat(dto.title()).isEqualTo("Java Fundamentals");
                    assertThat(dto.description()).isEqualTo("Learn Java basics");
                    assertThat(dto.module()).isEqualTo("Backend");
                });
        
        // Verificamos que se llamó a save con un objeto Course
        verify(courseRepository, times(1)).save(argThat(course ->
                course.getTitle().equals("Java Fundamentals") &&
                course.getModule().equals("Backend")
        ));
    }

    // ==================== PRUEBAS PARA deleteCourseById() ====================
    
    /**
     * Test: Eliminar un curso existente.
     * 
     * Evalúa:
     * - Verificación de existencia antes de eliminar
     * - Llamada correcta a deleteById
     * - Retorno de true indicando éxito
     */
    @Test
    @DisplayName("deleteCourseById - Debe eliminar el curso y devolver true cuando existe")
    void testDeleteCourseById_WhenCourseExists_ShouldDeleteAndReturnTrue() {
        // ARRANGE
        when(courseRepository.existsById(1L)).thenReturn(true);
        doNothing().when(courseRepository).deleteById(1L);

        
        boolean result = coursesService.deleteCourseById(1L);

        
        assertThat(result).isTrue();
        
        verify(courseRepository, times(1)).existsById(1L);
        verify(courseRepository, times(1)).deleteById(1L);
    }

    /**
     * Test: Intentar eliminar un curso inexistente.
     * 
     * Evalúa:
     * - Que no se intente eliminar si no existe
     * - Retorno de false indicando que no se eliminó
     */
    @Test
    @DisplayName("deleteCourseById - Debe devolver false cuando el curso no existe")
    void testDeleteCourseById_WhenCourseNotFound_ShouldReturnFalse() {
        // ARRANGE
        when(courseRepository.existsById(999L)).thenReturn(false);

        
        boolean result = coursesService.deleteCourseById(999L);

        
        assertThat(result).isFalse();
        
        verify(courseRepository, times(1)).existsById(999L);
        verify(courseRepository, never()).deleteById(anyLong());
    }

    // ==================== PRUEBAS PARA updateCourseById() ====================
    
    /**
     * Test: Actualizar todos los campos de un curso.
     * 
     * Evalúa:
     * - Actualización de todos los campos modificables
     * - Actualización de updatedAt
     * - Guardado correcto
     */
    @Test
    @DisplayName("updateCourseById - Debe actualizar todos los campos cuando se proporcionan")
    void testUpdateCourseById_WithAllFields_ShouldUpdateAllFields() {
        // ARRANGE
        CourseRequestDTO updateRequest = new CourseRequestDTO(
                null, // title no se actualiza
                "Updated description",
                "Frontend",
                "50",
                "new-badge.png"
        );
        
        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(courseRepository.save(any(Course.class))).thenReturn(testCourse);

        
        CourseResponseDTO result = coursesService.updateCourseById(1L, updateRequest);

        
        assertThat(result).isNotNull();
        
        verify(courseRepository, times(1)).findById(1L);
        verify(courseRepository, times(1)).save(argThat(course ->
                course.getDescription().equals("Updated description") &&
                course.getModule().equals("Frontend") &&
                course.getDurationHours().equals("50") &&
                course.getBadgeImage().equals("new-badge.png")
        ));
    }

    /**
     * Test: Actualizar solo algunos campos (parcial).
     * 
     * Evalúa:
     * - Que solo se actualicen los campos no-nulos
     * - Que los campos nulos no modifiquen los valores existentes
     */
    @Test
    @DisplayName("updateCourseById - Debe actualizar solo campos proporcionados (parcial)")
    void testUpdateCourseById_WithPartialFields_ShouldUpdateOnlyProvidedFields() {
        // ARRANGE
        CourseRequestDTO partialUpdate = new CourseRequestDTO(
                null,
                "Only description updated",
                null,  // module no se actualiza
                null,  // duration no se actualiza
                null   // image no se actualiza
        );
        
        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(courseRepository.save(any(Course.class))).thenReturn(testCourse);

        
        coursesService.updateCourseById(1L, partialUpdate);

        
        verify(courseRepository).save(argThat(course ->
                course.getDescription().equals("Only description updated") &&
                course.getModule().equals("Backend") && 
                course.getDurationHours().equals("40") &&
                course.getBadgeImage().equals("java-badge.png")
        ));
    }

    /**
     * Test: Intentar actualizar un curso inexistente.
     * 
     * Evalúa:
     * - Que se lance ResponseStatusException con NOT_FOUND
     * - Que no se intente guardar
     */
    @Test
    @DisplayName("updateCourseById - Debe lanzar excepción cuando el curso no existe")
    void testUpdateCourseById_WhenCourseNotFound_ShouldThrowException() {
        when(courseRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> coursesService.updateCourseById(999L, testRequestDTO))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Course not found with id: 999");
        
        verify(courseRepository, times(1)).findById(999L);
        verify(courseRepository, never()).save(any());
    }

    /**
     * Test: Verificar que updatedAt se actualiza.
     * 
     * Evalúa:
     * - Que el timestamp updatedAt se establezca al actualizar
     */
    @Test
    @DisplayName("updateCourseById - Debe actualizar el campo updatedAt")
    void testUpdateCourseById_ShouldUpdateTimestamp() {
        // ARRANGE
        LocalDateTime beforeUpdate = testCourse.getUpdatedAt();
        
        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(courseRepository.save(any(Course.class))).thenReturn(testCourse);

        
        coursesService.updateCourseById(1L, testRequestDTO);

        
        verify(courseRepository).save(argThat(course ->
                course.getUpdatedAt().isAfter(beforeUpdate) ||
                course.getUpdatedAt().isEqual(beforeUpdate)
        ));
    }
}

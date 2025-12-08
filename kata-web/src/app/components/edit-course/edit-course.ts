import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoursesService } from '../../services/courses.service';
import { Course, CreateCourseRequest } from '../../models/course.model';

@Component({
  selector: 'app-edit-course',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-course.html',
  styleUrl: './edit-course.css',
})
export class EditCourseComponent implements OnChanges {
  @Input() course!: Course;
  @Output() courseUpdated = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  private coursesService = inject(CoursesService);

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  formData: CreateCourseRequest = {
    title: '',
    description: '',
    module: '',
    duration: '',
    image: '',
  };

  availableModules: string[] = [
    'Programación Básica',
    'Programación',
    'Herramientas',
    'DevOps',
    'Backend Java',
    'Backend Node',
    'Frontend',
    'Frontend/Backend',
    'Bases de Datos',
    'NoSQL',
    'Cloud',
    'Arquitectura',
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['course']?.currentValue) {
      this.loadCourseData(changes['course'].currentValue as Course);
    }
  }

  private loadCourseData(course: Course): void {
    this.formData = {
      title: course.title,
      description: course.description,
      module: course.module,
      // Backend espera "duration"; usamos durationHours recibido
      duration: (course as any).duration ?? course.durationHours ?? '',
      image: (course as any).badgeImage ?? (course as any).image ?? '',
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  onSubmit(): void {
    if (!this.formData.title || !this.formData.description || !this.formData.module || !this.formData.duration) {
      this.errorMessage = 'Por favor completa todos los campos requeridos';
      return;
    }

    if (!this.course?.id) {
      this.errorMessage = 'Curso inválido';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.coursesService.updateCourse(this.course.id, this.formData).subscribe({
      next: (response) => {
        console.log('Curso actualizado:', response);
        this.successMessage = `¡Curso "${response.title}" actualizado!`;
        this.isLoading = false;
        setTimeout(() => {
          this.courseUpdated.emit();
          this.onClose();
        }, 1000);
      },
      error: (err) => {
        console.error('Error actualizando curso:', err);
        this.errorMessage = err.error?.message || 'Error al actualizar el curso';
        this.isLoading = false;
      },
    });
  }

  onClose(): void {
    this.closed.emit();
  }
}

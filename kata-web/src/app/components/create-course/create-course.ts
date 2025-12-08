import { Component, inject, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoursesService } from '../../services/courses.service';
import { CreateCourseRequest } from '../../models/course.model';

@Component({
  selector: 'app-create-course',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-course.html',
  styleUrl: './create-course.css',
})
export class CreateCourseComponent {
  private coursesService = inject(CoursesService);

  @Output() courseCreated = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  formData: CreateCourseRequest = {
    title: '',
    description: '',
    module: '',
    duration: '',
  };

  availableModules: string[] = [
    'Fullstack',
    'APIs e Integraciones',
    'Cloud',
    'Data Engineer'
  ];

  onSubmit(): void {
    if (!this.formData.title || !this.formData.description || !this.formData.module || !this.formData.duration) {
      this.errorMessage = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.coursesService.createCourse(this.formData).subscribe({
      next: (response) => {
        console.log('Curso creado exitosamente:', response);
        this.successMessage = `¡Curso "${response.title}" creado exitosamente!`;
        this.isLoading = false;
        
        // Limpiar formulario después de 2 segundos
        setTimeout(() => {
          this.resetForm();
          this.courseCreated.emit();
          this.onClose();
        }, 1500);
      },
      error: (err) => {
        console.error('Error creando curso:', err);
        this.errorMessage = err.error?.message || 'Error al crear el curso';
        this.isLoading = false;
      },
    });
  }

  resetForm(): void {
    this.formData = {
      title: '',
      description: '',
      module: '',
      duration: '',
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  onClose(): void {
    this.closed.emit();
  }
}

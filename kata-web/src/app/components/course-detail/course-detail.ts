import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CoursesService } from '../../services/courses.service';
import { Auth } from '../../services/auth';
import { Course, UserProgressDetail, CompleteCourseResponse } from '../../models/course.model';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-detail.html',
  styleUrl: './course-detail.css',
})
export class CourseDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private coursesService = inject(CoursesService);
  private authService = inject(Auth);
  private cdr = inject(ChangeDetectorRef);

  course: Course | null = null;
  isLoading = true;
  isEnrolling = false;
  isCompletingCourse = false;
  enrollmentError: string | null = null;
  enrollmentSuccess = false;
  completionError: string | null = null;
  completionSuccess = false;
  badgeEarned: number | null = null;
  userProgress: UserProgressDetail | null = null;
  error: string | null = null;
  role$ = this.authService.role$;
  isAdmin$ = this.authService.isAdmin$;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCourseDetail(+id);
    } else {
      this.error = 'No se encontró el ID del curso';
    }
  }

  loadCourseDetail(id: number): void {
    this.isLoading = true;
    this.error = null;

    this.coursesService.getCourseById(id).subscribe({
      next: (course: Course) => {
        this.course = course;
        this.isLoading = false;
        this.cdr.detectChanges();
        
        // Si no es admin, verificar si ya está inscrito
        if (!this.authService.isAdmin()) {
          this.checkUserEnrollment(course.id);
        }
      },
      error: (err: any) => {
        console.error('Error cargando detalle del curso:', err);
        this.error = 'No se pudo cargar el curso. Puede que no exista o no tengas permisos.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  checkUserEnrollment(courseId: number): void {
    const userEmail = this.authService.getUserEmail();
    if (!userEmail) {
      return;
    }

    this.coursesService.checkUserProgress(userEmail, courseId).subscribe({
      next: (progress: UserProgressDetail) => {
        console.log('Usuario ya está inscrito:', progress);
        this.userProgress = progress;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.log('Usuario no está inscrito en este curso');
        this.userProgress = null;
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  enrollCourse(): void {
    if (!this.course) {
      console.error('No hay curso cargado');
      return;
    }

    const userEmail = this.authService.getUserEmail();
    console.log('Email del usuario obtenido:', userEmail);
    
    if (!userEmail) {
      this.enrollmentError = 'No se pudo obtener tu email del token de autenticación';
      return;
    }

    this.isEnrolling = true;
    this.enrollmentError = null;
    this.enrollmentSuccess = false;

    this.coursesService
      .enrollCourse(userEmail, this.course.id)
      .subscribe({
        next: (userProgress) => {
          console.log('Usuario inscrito exitosamente:', userProgress);
          this.enrollmentSuccess = true;
          this.isEnrolling = false;
          
          // Verificar el progreso después de inscribirse
          this.checkUserEnrollment(this.course!.id);
          
          // Mostrar mensaje de éxito por 3 segundos
          setTimeout(() => {
            this.enrollmentSuccess = false;
          }, 3000);
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Error al inscribir usuario en curso:', err);
          this.enrollmentError =
            err.error?.message || 'Error al inscribirse en el curso. Intenta nuevamente.';
          this.isEnrolling = false;
          this.cdr.detectChanges();
        },
      });
  }

  completeCourse(): void {
    if (!this.course) {
      console.error('No hay curso cargado');
      return;
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      this.completionError = 'No se pudo obtener tu ID de usuario del token de autenticación';
      return;
    }

    const confirmComplete = window.confirm(
      `¿Estás seguro de que deseas marcar el curso "${this.course.title}" como completado?`
    );
    if (!confirmComplete) {
      return;
    }

    this.isCompletingCourse = true;
    this.completionError = null;
    this.completionSuccess = false;

    this.coursesService
      .completeCourse(this.course.id, userId)
      .subscribe({
        next: (response: CompleteCourseResponse) => {
          console.log('Curso completado exitosamente:', response);
          this.completionSuccess = true;
          this.badgeEarned = response.badge;
          this.isCompletingCourse = false;

          // Actualizar el progreso del usuario
          this.checkUserEnrollment(this.course!.id);

          // Mostrar mensaje de éxito por 5 segundos
          setTimeout(() => {
            this.completionSuccess = false;
            this.badgeEarned = null;
          }, 5000);

          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Error al completar curso:', err);
          this.completionError =
            err.error?.message || 'Error al completar el curso. Intenta nuevamente.';
          this.isCompletingCourse = false;
          this.cdr.detectChanges();
        },
      });
  }
}

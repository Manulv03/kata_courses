import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CoursesService } from '../../services/courses.service';
import { Auth } from '../../services/auth';
import { Course } from '../../models/course.model';

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
      },
      error: (err: any) => {
        console.error('Error cargando detalle del curso:', err);
        this.error = 'No se pudo cargar el curso. Puede que no exista o no tengas permisos.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}

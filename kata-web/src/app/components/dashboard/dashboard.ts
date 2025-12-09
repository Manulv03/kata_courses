import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { CoursesService } from '../../services/courses.service';
import { Course, PageableCourse, Badge, UserProgressDetail } from '../../models/course.model';
import { take } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CreateCourseComponent } from '../create-course/create-course';
import { EditCourseComponent } from '../edit-course/edit-course';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CreateCourseComponent, EditCourseComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private authService = inject(Auth);
  private router = inject(Router);
  private coursesService = inject(CoursesService);
  private cdr = inject(ChangeDetectorRef);

  role$ = this.authService.role$;
  isAdmin$ = this.authService.isAdmin$;
  isUser$ = this.authService.isUser$;

  activeView: 'courses' | 'badges' | 'progress' = 'courses';
  badges: Badge[] = [];
  isLoadingBadges = false;
  userProgress: UserProgressDetail[] = [];
  isLoadingProgress = false;

  courses: Course[] = [];
  isLoadingCourses = false;
  deletingCourseId: number | null = null;
  currentPage = 0;
  pageSize = 20;
  totalPages = 0;
  totalElements = 0;
  selectedModule: string = '';
  availableModules: string[] = [
    'Fullstack',
    'APIs e Integraciones',
    'Cloud',
    'Data Engineer'
  ];
  
  showCreateModal = false;
  showEditModal = false;
  courseToEdit: Course | null = null;

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(page: number = 0, size: number = 20, module?: string): void {
    console.log('Iniciando carga de cursos, página:', page, 'módulo:', module);
    this.isLoadingCourses = true;
    const params: any = { page, size };
    if (module) {
      params.module = module;
    }
    this.coursesService.listCourses(params).subscribe({
      next: (response: PageableCourse) => {
        console.log('Cursos cargados exitosamente:', response.content.length);
        this.courses = response.content;
        this.currentPage = response.number;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.pageSize = response.size;
        this.isLoadingCourses = false;
        console.log('Estado actualizado - isLoadingCourses:', this.isLoadingCourses, 'courses.length:', this.courses.length);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando cursos:', err);
        console.error('Detalles del error:', err.error);
        console.error('Status:', err.status);
        this.isLoadingCourses = false;
      },
    });
  }

  filterByModule(): void {
    this.currentPage = 0;
    this.loadCourses(0, this.pageSize, this.selectedModule || undefined);
  }

  clearFilter(): void {
    this.selectedModule = '';
    this.currentPage = 0;
    this.loadCourses(0, this.pageSize);
  }

  openCreateModal(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  onCourseCreated(): void {
    // Recargar cursos con los filtros actuales
    this.loadCourses(this.currentPage, this.pageSize, this.selectedModule || undefined);
  }

  openEditModal(course: Course): void {
    this.courseToEdit = course;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.courseToEdit = null;
  }

  onCourseUpdated(): void {
    this.loadCourses(this.currentPage, this.pageSize, this.selectedModule || undefined);
  }

  deleteCourse(course: Course): void {
    if (!course.id) {
      console.error('El curso no tiene id, no se puede eliminar');
      return;
    }

    const confirmDelete = window.confirm(`¿Eliminar el curso "${course.title}"?`);
    if (!confirmDelete) {
      return;
    }

    this.deletingCourseId = course.id;

    this.coursesService
      .deleteCourse(course.id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.loadCourses(this.currentPage, this.pageSize, this.selectedModule || undefined);
        },
        error: (err) => {
          console.error('Error eliminando curso:', err);
        },
        complete: () => {
          this.deletingCourseId = null;
        },
      });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  viewCourseDetail(course: Course): void {
    this.router.navigate(['/course', course.id]);
  }

  switchView(view: 'courses' | 'badges' | 'progress'): void {
    this.activeView = view;
    this.cdr.detectChanges();
    
    if (view === 'badges' && this.badges.length === 0 && !this.authService.isAdmin()) {
      this.loadBadges();
    }
    
    if (view === 'progress' && this.userProgress.length === 0 && !this.authService.isAdmin()) {
      this.loadUserProgress();
    }
  }

  loadBadges(): void {
    const userEmail = this.authService.getUserEmail();
    if (!userEmail) {
      console.error('No se pudo obtener el email del usuario');
      return;
    }

    console.log('Cargando badges para:', userEmail);
    this.isLoadingBadges = true;
    this.cdr.detectChanges();

    this.coursesService.getUserBadges(userEmail).subscribe({
      next: (badges: Badge[]) => {
        console.log('Badges recibidos:', badges);
        console.log('Cantidad de badges:', badges.length);
        this.badges = badges;
        this.isLoadingBadges = false;
        console.log('Estado actualizado - isLoadingBadges:', this.isLoadingBadges);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando badges:', err);
        this.badges = [];
        this.isLoadingBadges = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadUserProgress(): void {
    const userEmail = this.authService.getUserEmail();
    if (!userEmail) {
      console.error('No se pudo obtener el email del usuario');
      return;
    }

    console.log('Cargando progreso para:', userEmail);
    this.isLoadingProgress = true;
    this.cdr.detectChanges();

    this.coursesService.getAllUserProgress(userEmail).subscribe({
      next: (progress: UserProgressDetail[]) => {
        console.log('Progreso recibido:', progress);
        console.log('Cantidad de cursos:', progress.length);
        this.userProgress = progress;
        this.isLoadingProgress = false;
        console.log('Estado actualizado - isLoadingProgress:', this.isLoadingProgress);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando progreso:', err);
        this.userProgress = [];
        this.isLoadingProgress = false;
        this.cdr.detectChanges();
      },
    });
  }

  navigateToCourse(courseId: number): void {
    this.router.navigate(['/courses', courseId]);
  }
}

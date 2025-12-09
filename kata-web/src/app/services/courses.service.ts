import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageableCourse, CourseRequestParams, CreateCourseRequest, CourseResponse, Course, CreateUserProgressDto, UserProgress, UserProgressDetail, CompleteCourseResponse, Badge } from '../models/course.model';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root',
})
export class CoursesService {
  private apiUrl = 'http://localhost:8080/courses';
  private apiUrlNest = 'http://localhost:3000';
  private http = inject(HttpClient);
  private authService = inject(Auth);

  listCourses(params?: CourseRequestParams): Observable<PageableCourse> {
    let httpParams = new HttpParams();

    if (params?.module) {
      httpParams = httpParams.set('module', params.module);
    }
    if (params?.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.size !== undefined) {
      httpParams = httpParams.set('size', params.size.toString());
    }

    const token = this.authService.getToken();
    
    if (!token) {
      console.warn('No hay token disponible para la petición');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    console.log('Llamando API cursos con token:', token ? 'presente' : 'ausente');

    return this.http.get<PageableCourse>(`${this.apiUrl}`, { 
      params: httpParams,
      headers: headers 
    });
  }

  /**
   * Crea un nuevo curso (solo admin)
   * @param courseData - Datos del curso a crear
   * @returns Observable con la respuesta del servidor
   */
  createCourse(courseData: CreateCourseRequest): Observable<CourseResponse> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    console.log('Creando nuevo curso:', courseData);

    return this.http.post<CourseResponse>(`${this.apiUrl}/create`, courseData, {
      headers: headers,
    });
  }

  /**
   * Actualiza un curso existente (solo admin)
   * @param id - id del curso a editar
   * @param courseData - Datos actualizados del curso
   */
  updateCourse(id: number, courseData: CreateCourseRequest): Observable<CourseResponse> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    console.log('Actualizando curso:', id, courseData);

    return this.http.put<CourseResponse>(`${this.apiUrl}/${id}`, courseData, {
      headers: headers,
    });
  }

  /**
   * Elimina un curso por id (solo admin)
   * @param id - id del curso a eliminar
   */
  deleteCourse(id: number): Observable<void> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    console.log('Eliminando curso:', id);

    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, {
      headers: headers,
    });
  }

  /**
   * Obtiene el detalle de un curso por id (ambos roles)
   * @param id - id del curso a obtener
   */
  getCourseById(id: number): Observable<Course> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    console.log('Obteniendo detalle del curso:', id);

    return this.http.get<Course>(`${this.apiUrl}/${id}`, {
      headers: headers,
    });
  }

  /**
   * Inscribe un usuario en un curso
   * @param userEmail - Email del usuario
   * @param courseId - ID del curso
   */
  enrollCourse(userEmail: string, courseId: number): Observable<UserProgress> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const body: CreateUserProgressDto = {
      userEmail,
      courseId,
    };

    console.log('Inscribiendo usuario en curso:', body);

    return this.http.post<UserProgress>(`${this.apiUrlNest}/api/user-progress`, body, {
      headers: headers,
    });
  }

  /**
   * Verifica si un usuario está inscrito en un curso
   * @param userEmail - Email del usuario
   * @param courseId - ID del curso
   */
  checkUserProgress(userEmail: string, courseId: number): Observable<UserProgressDetail> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    console.log('Verificando progreso del usuario:', userEmail, 'en curso:', courseId);

    return this.http.get<UserProgressDetail>(
      `${this.apiUrlNest}/api/user-progress/user/${userEmail}/${courseId}`,
      { headers: headers }
    );
  }

  /**
   * Marca un curso como completado
   * @param courseId - ID del curso
   * @param userId - ID del usuario
   */
  completeCourse(courseId: number, userId: number): Observable<CompleteCourseResponse> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    console.log('Marcando curso como completado:', courseId, 'usuario:', userId);

    return this.http.patch<CompleteCourseResponse>(
      `${this.apiUrlNest}/api/user-progress/complete-course/${courseId}/${userId}`,
      {},
      { headers: headers }
    );
  }

  /**
   * Obtiene las insignias/badges de un usuario
   * @param userEmail - Email del usuario
   */
  getUserBadges(userEmail: string): Observable<Badge[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    console.log('Obteniendo badges del usuario:', userEmail);

    return this.http.get<Badge[]>(
      `${this.apiUrlNest}/api/badges/user/${userEmail}`,
      { headers: headers }
    );
  }

  /**
   * Obtiene todo el progreso de un usuario (todos los cursos iniciados/completados)
   * @param userEmail - Email del usuario
   */
  getAllUserProgress(userEmail: string): Observable<UserProgressDetail[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    console.log('Obteniendo progreso completo del usuario:', userEmail);

    return this.http.get<UserProgressDetail[]>(
      `${this.apiUrlNest}/api/user-progress/user/${userEmail}`,
      { headers: headers }
    );
  }
}

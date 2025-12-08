import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, map } from 'rxjs';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = 'http://localhost:8080/auth';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();

  private roleSubject = new BehaviorSubject<string | null>(this.getStoredRole());
  public role$: Observable<string | null> = this.roleSubject.asObservable();
  public isAdmin$: Observable<boolean> = this.role$.pipe(map((role) => role === 'admin'));
  public isUser$: Observable<boolean> = this.role$.pipe(map((role) => role === 'user'));

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<{ token: string }> {
    return this.http
      .post<{ token: string }>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((response) => {
          if (response && response.token) {
            if (this.isBrowser()) {
              localStorage.setItem('authToken', response.token);
            }
            const role = this.extractRole(response.token);
            this.roleSubject.next(role);
            this.isLoggedInSubject.next(true);
          }
        }),
        catchError((error) => {
          console.error('Error en la autenticación:', error);
          return throwError(() => error.error?.message || 'Error en la autenticación');
        })
      );
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('authToken');
    }
    this.roleSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  private hasToken(): boolean {
    if (!this.isBrowser()) {
      return false;
    }
    return !!localStorage.getItem('authToken');
  }

  getToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }
    return localStorage.getItem('authToken');
  }

  getRole(): string | null {
    return this.roleSubject.value;
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  isUser(): boolean {
    return this.getRole() === 'user';
  }

  private getStoredRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    return this.extractRole(token);
  }

  private extractRole(token: string): string | null {
    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) return null;
      const payload = JSON.parse(atob(payloadPart));
      const candidate =
        payload.role ||
        (Array.isArray(payload.roles) ? payload.roles[0] : undefined) ||
        (Array.isArray(payload.authorities) ? payload.authorities[0] : undefined);
      return typeof candidate === 'string' ? candidate.toLowerCase() : null;
    } catch (e) {
      console.warn('No se pudo extraer el rol del token', e);
      return null;
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}

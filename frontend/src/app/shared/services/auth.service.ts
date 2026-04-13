import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthResponse, LoginDto } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'hermes_token';
  private readonly USER_KEY = 'hermes_user';

  private userSignal = signal<User | null>(this.loadUser());
  private tokenSignal = signal<string | null>(this.loadToken());
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  user = this.userSignal.asReadonly();
  token = this.tokenSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();
  isAuthenticated = computed(() => !!this.tokenSignal());
  isAdmin = computed(() => this.userSignal()?.rol === 'ADMIN');

  private loadUser(): User | null {
    const stored = localStorage.getItem(this.USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  private loadToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  login(credentials: LoginDto): Observable<AuthResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.access_token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
        this.tokenSignal.set(response.access_token);
        this.userSignal.set(response.user);
        this.loadingSignal.set(false);
        
        const dashboard = this.isAdmin() ? '/inventory/alerts' : '/pos';
        this.router.navigate([dashboard]);
      }),
      catchError(err => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error de autenticación');
        throw err;
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  clearError(): void {
    this.errorSignal.set(null);
  }
}
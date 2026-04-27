import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-slate-50 to-primary-100 p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-6">
          <span
            class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 text-white shadow-lg mb-4"
            aria-hidden="true"
          >
            <svg class="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C9.79 2 8 3.79 8 6c0 1.85 1.28 3.4 3 3.86V12H6c-1.66 0-3 1.34-3 3v2h2v-2c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v2h2v-2c0-1.66-1.34-3-3-3h-5V9.86c1.72-.46 3-2.01 3-3.86 0-2.21-1.79-4-4-4zm0 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zM7 19c-1.1 0-2 .9-2 2h2v-2zm10 0v2h2c0-1.1-.9-2-2-2zm-5 0c-1.1 0-2 .9-2 2h4c0-1.1-.9-2-2-2z"/>
            </svg>
          </span>
          <h1 class="text-2xl font-bold text-slate-900">Veterinaria Hermes</h1>
          <p class="text-sm text-slate-500 mt-1">Sistema de Punto de Venta</p>
        </div>

        <div class="card p-8">
          <h2 class="text-lg font-semibold text-slate-800 mb-1">Iniciar sesión</h2>
          <p class="text-sm text-slate-500 mb-6">Ingresa tus credenciales para continuar</p>

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            @if (authService.error()) {
              <div class="alert-danger" role="alert">
                <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>{{ authService.error() }}</span>
              </div>
            }

            <div>
              <label for="email" class="input-label">Correo electrónico</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400" aria-hidden="true">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  required
                  class="input-field pl-10"
                  placeholder="correo@ejemplo.com"
                  autocomplete="email"
                />
              </div>
            </div>

            <div>
              <label for="password" class="input-label">Contraseña</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400" aria-hidden="true">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 11c0-1.105.895-2 2-2s2 .895 2 2-.895 2-2 2-2-.895-2-2zm-4 0c0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4-4 1.79-4 4zm-4 6V7a4 4 0 014-4h8a4 4 0 014 4v10a4 4 0 01-4 4H8a4 4 0 01-4-4z" />
                  </svg>
                </span>
                <input
                  id="password"
                  type="password"
                  [(ngModel)]="password"
                  name="password"
                  required
                  class="input-field pl-10"
                  placeholder="••••••••"
                  autocomplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              [disabled]="authService.loading()"
              class="btn-primary w-full btn-lg"
            >
              @if (authService.loading()) {
                <span class="spinner" aria-hidden="true"></span>
                <span>Ingresando...</span>
              } @else {
                <span>Iniciar sesión</span>
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              }
            </button>
          </form>
        </div>

        <p class="text-center text-xs text-slate-400 mt-6">
          &copy; {{ year }} Veterinaria Hermes &middot; Sistema POS
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  authService = inject(AuthService);
  email = '';
  password = '';
  year = new Date().getFullYear();

  onSubmit() {
    if (this.email && this.password) {
      this.authService.login({ email: this.email, password: this.password }).subscribe({
        error: () => {},
      });
    }
  }
}

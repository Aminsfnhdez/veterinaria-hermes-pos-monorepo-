import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-100">
      <div class="card w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-slate-800">Veterinaria Hermes</h1>
          <p class="text-slate-500 mt-2">Ingresa tus credenciales</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          @if (authService.error()) {
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {{ authService.error() }}
            </div>
          }

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              class="input-field"
              placeholder="correo&#64;ejemplo.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              required
              class="input-field"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            [disabled]="authService.loading()"
            class="btn-primary w-full flex justify-center py-3 text-base"
          >
            @if (authService.loading()) {
              <span class="animate-spin mr-2">⟳</span>
            }
            {{ authService.loading() ? 'Ingresando...' : 'Iniciar Sesión' }}
          </button>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  authService = inject(AuthService);
  email = '';
  password = '';

  onSubmit() {
    if (this.email && this.password) {
      this.authService.login({ email: this.email, password: this.password }).subscribe({
        error: () => {}
      });
    }
  }
}
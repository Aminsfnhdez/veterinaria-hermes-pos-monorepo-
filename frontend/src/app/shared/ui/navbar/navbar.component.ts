import { Component, inject } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  template: `
    <nav class="bg-white shadow-sm border-b border-slate-200 px-6 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-xl">🐾</span>
          <span class="font-bold text-slate-800">Veterinaria Hermes</span>
        </div>
        
        <div class="flex items-center gap-4">
          @if (authService.user()) {
            <div class="flex items-center gap-2">
              <span class="text-sm text-slate-600">{{ authService.user()?.nombre }}</span>
              <span class="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600">
                {{ authService.user()?.rol }}
              </span>
            </div>
            <button 
              (click)="authService.logout()"
              class="text-sm text-red-600 hover:text-red-800"
            >
              Cerrar sesión
            </button>
          }
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  authService = inject(AuthService);
}
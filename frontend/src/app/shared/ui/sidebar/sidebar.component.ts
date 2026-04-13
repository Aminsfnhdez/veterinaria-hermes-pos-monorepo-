import { Component, inject, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="w-64 bg-white border-r border-slate-200 min-h-screen p-4">
      <nav class="space-y-2">
        <a 
          routerLink="/pos" 
          routerLinkActive="bg-primary text-white"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <span>🛒</span>
          <span class="font-medium">Punto de Venta</span>
        </a>

        <a 
          routerLink="/inventory/products" 
          routerLinkActive="bg-primary text-white"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <span>📦</span>
          <span class="font-medium">Inventario</span>
        </a>

        @if (authService.isAdmin()) {
          <a 
            routerLink="/inventory/alerts" 
            routerLinkActive="bg-primary text-white"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <span>⚠️</span>
            <span class="font-medium">Alertas</span>
          </a>
        }

        <a 
          routerLink="/invoices" 
          routerLinkActive="bg-primary text-white"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <span>📄</span>
          <span class="font-medium">Facturas</span>
        </a>
      </nav>
    </aside>
  `
})
export class SidebarComponent {
  authService = inject(AuthService);
}
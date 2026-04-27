import { Component, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside
      class="fixed top-16 left-0 z-30 w-64 h-[calc(100vh-4rem)] bg-white border-r border-slate-200
             transition-transform duration-200 ease-in-out
             lg:translate-x-0"
      [class.translate-x-0]="open()"
      [class.-translate-x-full]="!open()"
      aria-label="Navegación principal"
    >
      <div class="h-full flex flex-col">
        <nav class="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <p class="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Operación
          </p>

          <a
            routerLink="/pos"
            routerLinkActive="sidebar-link-active"
            [routerLinkActiveOptions]="{ exact: false }"
            class="sidebar-link"
            (click)="closed.emit()"
          >
            <svg class="sidebar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span class="flex-1">Punto de Venta</span>
          </a>

          <a
            routerLink="/invoices"
            routerLinkActive="sidebar-link-active"
            class="sidebar-link"
            (click)="closed.emit()"
          >
            <svg class="sidebar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span class="flex-1">Facturas</span>
          </a>

          <p class="px-3 mt-5 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Inventario
          </p>

          <a
            routerLink="/inventory/products"
            routerLinkActive="sidebar-link-active"
            class="sidebar-link"
            (click)="closed.emit()"
          >
            <svg class="sidebar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <span class="flex-1">Productos</span>
          </a>

          @if (authService.isAdmin()) {
            <a
              routerLink="/inventory/alerts"
              routerLinkActive="sidebar-link-active"
              class="sidebar-link"
              (click)="closed.emit()"
            >
              <svg class="sidebar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span class="flex-1">Alertas</span>
            </a>
          }
        </nav>

        <div class="px-3 py-4 border-t border-slate-100">
          <div class="px-3 py-2 rounded-lg bg-primary-50 border border-primary-100">
            <p class="text-xs font-semibold text-primary-800">Veterinaria Hermes</p>
            <p class="text-[11px] text-primary-700 mt-0.5">IVA 19% · Facturación DIAN</p>
          </div>
        </div>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  authService = inject(AuthService);
  open = input<boolean>(false);
  closed = output<void>();
}

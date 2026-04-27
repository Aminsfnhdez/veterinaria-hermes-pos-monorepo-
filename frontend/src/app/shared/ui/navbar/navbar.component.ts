import { Component, inject, output, signal, HostListener, ElementRef } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  template: `
    <nav
      class="fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center"
    >
      <div class="flex items-center justify-between w-full gap-4">
        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="toggleSidebar.emit()"
            class="lg:hidden btn-icon"
            aria-label="Abrir menú lateral"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <a class="flex items-center gap-2.5" href="/">
            <span
              class="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-600 text-white shadow-sm"
              aria-hidden="true"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C9.79 2 8 3.79 8 6c0 1.85 1.28 3.4 3 3.86V12H6c-1.66 0-3 1.34-3 3v2h2v-2c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v2h2v-2c0-1.66-1.34-3-3-3h-5V9.86c1.72-.46 3-2.01 3-3.86 0-2.21-1.79-4-4-4zm0 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zM7 19c-1.1 0-2 .9-2 2h2v-2zm10 0v2h2c0-1.1-.9-2-2-2zm-5 0c-1.1 0-2 .9-2 2h4c0-1.1-.9-2-2-2z"/>
              </svg>
            </span>
            <div class="hidden sm:block leading-tight">
              <p class="text-sm font-bold text-slate-900">Veterinaria Hermes</p>
              <p class="text-[11px] text-slate-500 font-medium">Sistema POS</p>
            </div>
          </a>
        </div>

        @if (authService.user(); as user) {
          <div class="relative" #userMenu>
            <button
              type="button"
              (click)="menuOpen.update((v) => !v)"
              class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-colors"
              [attr.aria-expanded]="menuOpen()"
              aria-haspopup="true"
            >
              <span
                class="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm"
              >
                {{ initials(user.nombre) }}
              </span>
              <span class="hidden md:flex flex-col items-start leading-tight">
                <span class="text-sm font-medium text-slate-800">{{ user.nombre }}</span>
                <span class="text-xs text-slate-500">{{ user.rol }}</span>
              </span>
              <svg
                class="hidden md:block w-4 h-4 text-slate-400 transition-transform"
                [class.rotate-180]="menuOpen()"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            @if (menuOpen()) {
              <div
                class="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50"
                role="menu"
              >
                <div class="px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <p class="text-sm font-semibold text-slate-900 truncate">{{ user.nombre }}</p>
                  <p class="text-xs text-slate-500 truncate">{{ user.email }}</p>
                  <span class="badge-primary mt-2">{{ user.rol }}</span>
                </div>
                <button
                  type="button"
                  (click)="onLogout()"
                  class="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  role="menuitem"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            }
          </div>
        }
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  authService = inject(AuthService);
  toggleSidebar = output<void>();
  menuOpen = signal(false);

  private elementRef = inject(ElementRef<HTMLElement>);

  initials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  onLogout() {
    this.menuOpen.set(false);
    this.authService.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.menuOpen() && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.menuOpen.set(false);
    }
  }
}

import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './shared/ui/navbar/navbar.component';
import { SidebarComponent } from './shared/ui/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    @if (isLoginPage()) {
      <router-outlet />
    } @else {
      <div class="min-h-screen bg-slate-50">
        <app-navbar (toggleSidebar)="toggleSidebar()" />
        <app-sidebar [open]="sidebarOpen()" (closed)="sidebarOpen.set(false)" />

        <div class="lg:pl-64 pt-16">
          <main class="min-h-[calc(100vh-4rem-3rem)]">
            <router-outlet />
          </main>

          <footer class="bg-white border-t border-slate-200 px-6 py-4">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-500">
              <p>&copy; {{ currentYear }} Veterinaria Hermes. Todos los derechos reservados.</p>
              <p class="text-xs">Sistema POS v1.0</p>
            </div>
          </footer>
        </div>

        @if (sidebarOpen()) {
          <div
            class="fixed inset-0 bg-slate-900/50 z-30 lg:hidden"
            (click)="sidebarOpen.set(false)"
            aria-hidden="true"
          ></div>
        }
      </div>
    }
  `,
})
export class App {
  private router = inject(Router);
  currentYear = new Date().getFullYear();
  sidebarOpen = signal(false);

  isLoginPage = () => this.router.url === '/login';

  toggleSidebar() {
    this.sidebarOpen.update((v: boolean) => !v);
  }
}

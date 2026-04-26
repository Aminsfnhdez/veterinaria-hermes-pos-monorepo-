import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
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
      <div class="min-h-screen bg-slate-100">
        <app-navbar />
        <div class="flex">
          <app-sidebar />
          <main class="flex-1 min-h-[calc(100vh-112px)]">
            <router-outlet />
          </main>
        </div>
        <footer class="border-t border-slate-200 bg-white px-6 py-3 text-center text-sm text-slate-600">
          © {{ currentYear }} Houdini. Todos los derechos reservados.
        </footer>
      </div>
    }
  `
})
export class App {
  private router = inject(Router);
  currentYear = new Date().getFullYear();

  isLoginPage = () => {
    return this.router.url === '/login';
  };
}
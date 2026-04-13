import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './shared/services/auth.service';
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
          <main class="flex-1 min-h-[calc(100vh-64px)]">
            <router-outlet />
          </main>
        </div>
      </div>
    }
  `
})
export class App {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  isLoginPage = () => {
    return this.router.url === '/login';
  };
}
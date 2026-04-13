import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  template: `
    <div class="flex items-center justify-center p-4">
      <div class="animate-spin text-4xl">⟳</div>
      @if (message()) {
        <span class="ml-3 text-slate-600">{{ message() }}</span>
      }
    </div>
  `
})
export class LoadingComponent {
  message = input<string>('Cargando...');
}
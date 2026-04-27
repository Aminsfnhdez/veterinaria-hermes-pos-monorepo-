import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ProductService } from '../../../shared/services/product.service';
import { Product } from '../../../shared/models/product.model';

@Component({
  selector: 'app-alerts-dashboard',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="p-4 sm:p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-900">Panel de alertas</h1>
        <p class="text-sm text-slate-500 mt-1">Productos con stock bajo, próximos a vencer o vencidos</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="stat-card">
          <div class="flex items-start justify-between">
            <div>
              <p class="stat-label">Stock bajo</p>
              <p class="stat-value mt-2 text-amber-600">{{ lowStockProducts().length }}</p>
              <p class="text-xs text-slate-500 mt-1">Productos por reabastecer</p>
            </div>
            <span class="stat-icon bg-amber-100 text-amber-600">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </span>
          </div>
        </div>

        <div class="stat-card">
          <div class="flex items-start justify-between">
            <div>
              <p class="stat-label">Por vencer (30 días)</p>
              <p class="stat-value mt-2 text-yellow-600">{{ expiringSoonProducts().length }}</p>
              <p class="text-xs text-slate-500 mt-1">Próximos a caducar</p>
            </div>
            <span class="stat-icon bg-yellow-100 text-yellow-600">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
        </div>

        <div class="stat-card">
          <div class="flex items-start justify-between">
            <div>
              <p class="stat-label">Vencidos</p>
              <p class="stat-value mt-2 text-red-600">{{ expiredProducts().length }}</p>
              <p class="text-xs text-slate-500 mt-1">No pueden venderse</p>
            </div>
            <span class="stat-icon bg-red-100 text-red-600">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      @if (lowStockProducts().length > 0) {
        <div class="card mb-6 p-0 overflow-hidden">
          <header class="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-600">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </span>
            <h2 class="text-base font-semibold text-slate-800">Productos con stock bajo</h2>
          </header>
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th class="text-center">Stock actual</th>
                  <th class="text-center">Stock mínimo</th>
                </tr>
              </thead>
              <tbody>
                @for (product of lowStockProducts(); track product.id) {
                  <tr>
                    <td class="font-medium text-slate-900">{{ product.nombre }}</td>
                    <td class="text-center"><span class="badge-warning">{{ product.stock }}</span></td>
                    <td class="text-center text-slate-500 tabular-nums">{{ product.stockMinimo }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      @if (expiringSoonProducts().length > 0) {
        <div class="card mb-6 p-0 overflow-hidden">
          <header class="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-100 text-yellow-600">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <h2 class="text-base font-semibold text-slate-800">Productos próximos a vencer</h2>
          </header>
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Lote</th>
                  <th>Fecha caducidad</th>
                </tr>
              </thead>
              <tbody>
                @for (product of expiringSoonProducts(); track product.id) {
                  <tr>
                    <td class="font-medium text-slate-900">{{ product.nombre }}</td>
                    <td class="text-slate-500">{{ product.lote || '—' }}</td>
                    <td><span class="badge-warning">{{ product.fechaCaducidad | date:'dd/MM/yyyy' }}</span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      @if (expiredProducts().length > 0) {
        <div class="card p-0 overflow-hidden">
          <header class="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
            <h2 class="text-base font-semibold text-slate-800">Productos vencidos</h2>
          </header>
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Lote</th>
                  <th>Fecha caducidad</th>
                </tr>
              </thead>
              <tbody>
                @for (product of expiredProducts(); track product.id) {
                  <tr>
                    <td class="font-medium text-slate-900">{{ product.nombre }}</td>
                    <td class="text-slate-500">{{ product.lote || '—' }}</td>
                    <td><span class="badge-danger">{{ product.fechaCaducidad | date:'dd/MM/yyyy' }}</span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      @if (lowStockProducts().length === 0 && expiringSoonProducts().length === 0 && expiredProducts().length === 0) {
        <div class="card text-center py-16">
          <span class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <p class="text-lg font-semibold text-slate-800">Todo en orden</p>
          <p class="text-sm text-slate-500 mt-1">No hay alertas pendientes en este momento</p>
        </div>
      }
    </div>
  `,
})
export class AlertsDashboardComponent implements OnInit {
  private productService = inject(ProductService);

  lowStockProducts = signal<Product[]>([]);
  expiringSoonProducts = signal<Product[]>([]);
  expiredProducts = signal<Product[]>([]);

  ngOnInit() {
    this.loadAlerts();
  }

  loadAlerts() {
    this.productService.getLowStock().subscribe({
      next: (products) => this.lowStockProducts.set(products),
    });

    this.productService.getExpiringSoon().subscribe({
      next: (products) => this.expiringSoonProducts.set(products),
    });

    this.productService.getExpired().subscribe({
      next: (products) => this.expiredProducts.set(products),
    });
  }
}

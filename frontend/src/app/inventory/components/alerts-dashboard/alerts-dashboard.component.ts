import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ProductService } from '../../../shared/services/product.service';
import { Product } from '../../../shared/models/product.model';

@Component({
  selector: 'app-alerts-dashboard',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-slate-800 mb-6">Panel de Alertas</h1>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card border-l-4 border-orange-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-500">Stock Bajo</p>
              <p class="text-3xl font-bold text-orange-600">{{ lowStockProducts().length }}</p>
            </div>
            <span class="text-4xl">📦</span>
          </div>
        </div>

        <div class="card border-l-4 border-yellow-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-500">Por Vencer (30 días)</p>
              <p class="text-3xl font-bold text-yellow-600">{{ expiringSoonProducts().length }}</p>
            </div>
            <span class="text-4xl">⏰</span>
          </div>
        </div>

        <div class="card border-l-4 border-red-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-500">Vencidos</p>
              <p class="text-3xl font-bold text-red-600">{{ expiredProducts().length }}</p>
            </div>
            <span class="text-4xl">❌</span>
          </div>
        </div>
      </div>

      @if (lowStockProducts().length > 0) {
        <div class="card mb-6">
          <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span>📦</span> Productos con Stock Bajo
          </h2>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-slate-50">
                <tr>
                  <th class="px-4 py-2 text-left text-sm font-medium text-slate-600">Producto</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-slate-600">Stock</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-slate-600">Stock Mínimo</th>
                </tr>
              </thead>
              <tbody>
                @for (product of lowStockProducts(); track product.id) {
                  <tr class="border-t border-slate-100">
                    <td class="px-4 py-2">{{ product.nombre }}</td>
                    <td class="px-4 py-2 text-orange-600 font-bold">{{ product.stock }}</td>
                    <td class="px-4 py-2 text-slate-500">{{ product.stockMinimo }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      @if (expiringSoonProducts().length > 0) {
        <div class="card mb-6">
          <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span>⏰</span> Productos Próximos a Vencer
          </h2>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-slate-50">
                <tr>
                  <th class="px-4 py-2 text-left text-sm font-medium text-slate-600">Producto</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-slate-600">Lote</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-slate-600">Fecha Caducidad</th>
                </tr>
              </thead>
              <tbody>
                @for (product of expiringSoonProducts(); track product.id) {
                  <tr class="border-t border-slate-100">
                    <td class="px-4 py-2">{{ product.nombre }}</td>
                    <td class="px-4 py-2 text-slate-500">{{ product.lote || '-' }}</td>
                    <td class="px-4 py-2 text-yellow-600">{{ product.fechaCaducidad | date:'dd/MM/yyyy' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      @if (expiredProducts().length > 0) {
        <div class="card">
          <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span>❌</span> Productos Vencidos
          </h2>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-slate-50">
                <tr>
                  <th class="px-4 py-2 text-left text-sm font-medium text-slate-600">Producto</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-slate-600">Lote</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-slate-600">Fecha Caducidad</th>
                </tr>
              </thead>
              <tbody>
                @for (product of expiredProducts(); track product.id) {
                  <tr class="border-t border-slate-100">
                    <td class="px-4 py-2">{{ product.nombre }}</td>
                    <td class="px-4 py-2 text-slate-500">{{ product.lote || '-' }}</td>
                    <td class="px-4 py-2 text-red-600">{{ product.fechaCaducidad | date:'dd/MM/yyyy' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      @if (lowStockProducts().length === 0 && expiringSoonProducts().length === 0 && expiredProducts().length === 0) {
        <div class="card text-center py-12">
          <span class="text-6xl mb-4">✅</span>
          <p class="text-xl text-slate-600">No hay alertas pendientes</p>
        </div>
      }
    </div>
  `
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
      next: (products) => this.lowStockProducts.set(products)
    });

    this.productService.getExpiringSoon().subscribe({
      next: (products) => this.expiringSoonProducts.set(products)
    });

    this.productService.getExpired().subscribe({
      next: (products) => this.expiredProducts.set(products)
    });
  }
}
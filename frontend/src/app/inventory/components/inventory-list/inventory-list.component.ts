import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../shared/services/product.service';
import { AuthService } from '../../../shared/services/auth.service';
import { Product, CategoriaProducto } from '../../../shared/models/product.model';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="p-4 sm:p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Inventario</h1>
          <p class="text-sm text-slate-500 mt-1">Gestiona productos, stock y precios</p>
        </div>
        @if (authService.isAdmin()) {
          <a routerLink="/inventory/products/new" class="btn-primary">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo producto
          </a>
        }
      </div>

      <div class="card p-4 mb-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="sm:col-span-2 relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400" aria-hidden="true">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (input)="filterProducts()"
              placeholder="Buscar por nombre o descripción..."
              class="input-field pl-10"
              aria-label="Buscar producto"
            />
          </div>
          <select
            [(ngModel)]="categoryFilter"
            (change)="filterProducts()"
            class="input-field"
            aria-label="Filtrar por categoría"
          >
            <option value="">Todas las categorías</option>
            <option value="MEDICAMENTO">Medicamento</option>
            <option value="ALIMENTO">Alimento</option>
            <option value="ACCESORIO">Accesorio</option>
          </select>
        </div>
      </div>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th class="text-right">Precio</th>
              <th class="text-center">Stock</th>
              <th>Estado</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (product of filteredProducts(); track product.id) {
              <tr>
                <td>
                  <div>
                    <p class="font-medium text-slate-900">{{ product.nombre }}</p>
                    @if (product.descripcion) {
                      <p class="text-xs text-slate-500 mt-0.5 line-clamp-1">{{ product.descripcion }}</p>
                    }
                  </div>
                </td>
                <td>
                  <span [class]="getCategoryBadgeClass(product.categoria)">
                    {{ getCategoryLabel(product.categoria) }}
                  </span>
                </td>
                <td class="text-right font-medium text-slate-800 tabular-nums">
                  &#36;{{ product.precio }}
                </td>
                <td class="text-center">
                  <span [class]="getStockBadgeClass(product)">
                    {{ product.stock }}
                  </span>
                </td>
                <td>
                  @if (product.activo) {
                    <span class="badge-success badge-dot">Activo</span>
                  } @else {
                    <span class="badge badge-dot">Inactivo</span>
                  }
                </td>
                <td class="actions">
                  @if (authService.isAdmin()) {
                    <a
                      [routerLink]="['/inventory/products', product.id, 'edit']"
                      class="btn-link"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </a>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>

        @if (filteredProducts().length === 0) {
          <div class="table-empty">
            <svg class="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p class="font-medium text-slate-700">No hay productos</p>
            <p class="text-xs text-slate-500 mt-1">Ajusta los filtros o registra un nuevo producto</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class InventoryListComponent implements OnInit {
  private productService = inject(ProductService);
  authService = inject(AuthService);

  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  searchTerm = '';
  categoryFilter = '';

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getAll().subscribe({
      next: (products) => {
        this.products.set(products);
        this.filterProducts();
      },
    });
  }

  filterProducts() {
    let filtered = this.products();

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.nombre.toLowerCase().includes(term) ||
          p.descripcion?.toLowerCase().includes(term),
      );
    }

    if (this.categoryFilter) {
      filtered = filtered.filter((p) => p.categoria === this.categoryFilter);
    }

    this.filteredProducts.set(filtered);
  }

  getCategoryBadgeClass(categoria: CategoriaProducto): string {
    switch (categoria) {
      case 'MEDICAMENTO':
        return 'badge-info';
      case 'ALIMENTO':
        return 'badge-success';
      case 'ACCESORIO':
        return 'badge-purple';
      default:
        return 'badge';
    }
  }

  getCategoryLabel(categoria: CategoriaProducto): string {
    switch (categoria) {
      case 'MEDICAMENTO':
        return 'Medicamento';
      case 'ALIMENTO':
        return 'Alimento';
      case 'ACCESORIO':
        return 'Accesorio';
      default:
        return categoria;
    }
  }

  getStockBadgeClass(product: Product): string {
    if (product.stock === 0) return 'badge-danger';
    if (product.stock <= product.stockMinimo) return 'badge-warning';
    return 'badge-success';
  }
}

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
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-slate-800">Inventario</h1>
        @if (authService.isAdmin()) {
          <a routerLink="/inventory/products/new" class="btn-primary">
            + Nuevo Producto
          </a>
        }
      </div>

      <div class="flex gap-4 mb-4">
        <input
          type="text"
          [(ngModel)]="searchTerm"
          (input)="filterProducts()"
          placeholder="Buscar producto..."
          class="input-field max-w-xs"
        />
        <select [(ngModel)]="categoryFilter" (change)="filterProducts()" class="input-field max-w-xs">
          <option value="">Todas las categorías</option>
          <option value="MEDICAMENTO">Medicamento</option>
          <option value="ALIMENTO">Alimento</option>
          <option value="ACCESORIO">Accesorio</option>
        </select>
      </div>

      <div class="card overflow-hidden p-0">
        <table class="w-full">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-600">Nombre</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-600">Categoría</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-600">Precio</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-600">Stock</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-600">Estado</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (product of filteredProducts(); track product.id) {
              <tr class="border-t border-slate-100 hover:bg-slate-50">
                <td class="px-4 py-3">
                  <div>
                    <span class="font-medium text-slate-800">{{ product.nombre }}</span>
                    @if (product.descripcion) {
                      <p class="text-sm text-slate-500">{{ product.descripcion }}</p>
                    }
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 rounded text-xs" 
                    [class]="getCategoryClass(product.categoria)">
                    {{ getCategoryLabel(product.categoria) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-slate-700">\${{ product.precio }}</td>
                <td class="px-4 py-3">
                  <span [class]="getStockClass(product)">
                    {{ product.stock }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  @if (product.activo) {
                    <span class="text-green-600">Activo</span>
                  } @else {
                    <span class="text-red-500">Inactivo</span>
                  }
                </td>
                <td class="px-4 py-3">
                  @if (authService.isAdmin()) {
                    <a [routerLink]="['/inventory/products', product.id, 'edit']" 
                       class="text-primary hover:underline text-sm">
                      Editar
                    </a>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>

        @if (filteredProducts().length === 0) {
          <p class="text-center py-8 text-slate-500">No hay productos</p>
        }
      </div>
    </div>
  `
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
      }
    });
  }

  filterProducts() {
    let filtered = this.products();
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.nombre.toLowerCase().includes(term) ||
        p.descripcion?.toLowerCase().includes(term)
      );
    }
    
    if (this.categoryFilter) {
      filtered = filtered.filter(p => p.categoria === this.categoryFilter);
    }
    
    this.filteredProducts.set(filtered);
  }

  getCategoryClass(categoria: CategoriaProducto): string {
    switch (categoria) {
      case 'MEDICAMENTO': return 'bg-blue-100 text-blue-700';
      case 'ALIMENTO': return 'bg-green-100 text-green-700';
      case 'ACCESORIO': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }

  getCategoryLabel(categoria: CategoriaProducto): string {
    switch (categoria) {
      case 'MEDICAMENTO': return 'Medicamento';
      case 'ALIMENTO': return 'Alimento';
      case 'ACCESORIO': return 'Accesorio';
      default: return categoria;
    }
  }

  getStockClass(product: Product): string {
    if (product.stock === 0) return 'text-red-600 font-bold';
    if (product.stock <= product.stockMinimo) return 'text-orange-600 font-medium';
    return 'text-slate-700';
  }
}
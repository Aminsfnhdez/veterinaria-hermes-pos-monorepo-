import { Component, inject, signal, output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../shared/services/product.service';
import { Product } from '../../../shared/models/product.model';

@Component({
  selector: 'app-product-search',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="relative">
      <label for="product-search" class="sr-only">Buscar producto</label>
      <div class="relative">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400" aria-hidden="true">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          id="product-search"
          type="text"
          [(ngModel)]="searchTerm"
          (input)="onSearch()"
          (focus)="showDropdown = true"
          (blur)="onBlur()"
          placeholder="Buscar producto por nombre o descripción..."
          class="input-field pl-10"
          aria-describedby="product-search-hint"
          aria-expanded="false"
          autocomplete="off"
        />
      </div>
      <span id="product-search-hint" class="sr-only">Escriba para buscar productos activos</span>

      @if (showDropdown && filteredProducts().length > 0) {
        <ul
          class="dropdown-panel max-h-72 overflow-auto"
          role="listbox"
          aria-label="Resultados de búsqueda"
        >
          @for (product of filteredProducts(); track product.id) {
            <li>
              <button
                type="button"
                (click)="selectProduct(product)"
                class="dropdown-item flex justify-between items-center gap-3"
                role="option"
              >
                <div class="min-w-0 flex-1">
                  <p class="font-medium text-slate-800 truncate">{{ product.nombre }}</p>
                  @if (product.descripcion) {
                    <p class="text-xs text-slate-500 truncate mt-0.5">{{ product.descripcion }}</p>
                  }
                </div>
                <div class="flex flex-col items-end gap-0.5 flex-shrink-0">
                  <span class="text-sm font-semibold text-slate-900 tabular-nums">&#36;{{ product.precio }}</span>
                  <span
                    class="text-[11px] font-medium"
                    [class.text-red-600]="product.stock === 0"
                    [class.text-amber-600]="product.stock > 0 && product.stock <= product.stockMinimo"
                    [class.text-emerald-600]="product.stock > product.stockMinimo"
                  >
                    Stock: {{ product.stock }}
                  </span>
                </div>
              </button>
            </li>
          }
        </ul>
      }

      @if (searchTerm && filteredProducts().length === 0 && !loading()) {
        <div class="dropdown-panel p-4 text-center" role="status">
          <p class="text-sm text-slate-500">No se encontraron productos</p>
        </div>
      }
    </div>
  `,
})
export class ProductSearchComponent implements OnInit {
  private productService = inject(ProductService);

  productSelected = output<Product>();

  searchTerm = '';
  showDropdown = false;
  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    this.productService.getAll().subscribe({
      next: (products) => {
        this.products.set(products.filter((p) => p.activo && p.stock > 0));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase();
    if (!term) {
      this.filteredProducts.set(this.products());
      return;
    }

    this.filteredProducts.set(
      this.products().filter(
        (p) =>
          p.nombre.toLowerCase().includes(term) ||
          p.descripcion?.toLowerCase().includes(term),
      ),
    );
  }

  selectProduct(product: Product) {
    this.searchTerm = '';
    this.showDropdown = false;
    this.productSelected.emit(product);
  }

  onBlur() {
    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
  }
}

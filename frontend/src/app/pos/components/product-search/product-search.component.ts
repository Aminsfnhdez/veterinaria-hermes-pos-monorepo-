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
      <input
        id="product-search"
        type="text"
        [(ngModel)]="searchTerm"
        (input)="onSearch()"
        (focus)="showDropdown = true"
        (blur)="onBlur()"
        placeholder="Buscar producto..."
        class="input-field w-full"
        aria-describedby="product-search-hint"
        aria-expanded="false"
        autocomplete="off"
      />
      <span id="product-search-hint" class="sr-only">Escriba para buscar productos activos</span>
      
      @if (showDropdown && filteredProducts().length > 0) {
        <ul 
          class="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto" 
          role="listbox"
          aria-label="Resultados de búsqueda"
        >
          @for (product of filteredProducts(); track product.id) {
            <li>
              <button
                type="button"
                (click)="selectProduct(product)"
                class="w-full text-left px-4 py-3 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none flex justify-between items-center transition-colors duration-150"
                role="option"
              >
                <span class="font-medium text-slate-800">{{ product.nombre }}</span>
                <span class="text-sm text-slate-500">
                  \${{ product.precio }} | Stock: {{ product.stock }}
                </span>
              </button>
            </li>
          }
        </ul>
      }

      @if (searchTerm && filteredProducts().length === 0 && !loading()) {
        <div class="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-4 text-center text-slate-500" role="status">
          No se encontraron productos
        </div>
      }
    </div>
  `
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
        this.products.set(products.filter(p => p.activo && p.stock > 0));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase();
    if (!term) {
      this.filteredProducts.set(this.products());
      return;
    }
    
    this.filteredProducts.set(
      this.products().filter(p => 
        p.nombre.toLowerCase().includes(term) ||
        p.descripcion?.toLowerCase().includes(term)
      )
    );
  }

  selectProduct(product: Product) {
    this.searchTerm = product.nombre;
    this.showDropdown = false;
    this.productSelected.emit(product);
  }

  onBlur() {
    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
  }
}
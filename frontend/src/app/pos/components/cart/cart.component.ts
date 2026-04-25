import { Component, input, output, signal, computed } from '@angular/core';
import { Product } from '../../../shared/models/product.model';

export interface CartItem {
  product: Product;
  cantidad: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  template: `
    <div class="card">
      <h3 class="font-semibold text-slate-800 mb-4">Carrito de Compras</h3>
      
      @if (items().length === 0) {
        <p class="text-slate-500 text-center py-8">El carrito está vacío</p>
      } @else {
        <div class="space-y-3 mb-4">
          @for (item of items(); track item.product.id) {
            <div class="flex justify-between items-center border-b border-slate-100 pb-3">
              <div class="flex-1 min-w-0">
                <p class="font-medium text-slate-800 truncate">{{ item.product.nombre }}</p>
                <p class="text-sm text-slate-500">
                  \${{ item.product.precio }} x {{ item.cantidad }}
                </p>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0">
                <button 
                  type="button"
                  (click)="decrementQuantity(item)"
                  [disabled]="item.cantidad <= 1"
                  class="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
                  [attr.aria-label]="'Disminuir cantidad de ' + item.product.nombre"
                >
                  −
                </button>
                <span class="w-8 text-center font-medium" aria-live="polite">{{ item.cantidad }}</span>
                <button 
                  type="button"
                  (click)="incrementQuantity(item)"
                  class="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors duration-200"
                  [attr.aria-label]="'Aumentar cantidad de ' + item.product.nombre"
                >
                  +
                </button>
                <button 
                  type="button"
                  (click)="removeItem(item)"
                  class="w-9 h-9 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors duration-200 ml-1"
                  [attr.aria-label]="'Eliminar ' + item.product.nombre + ' del carrito'"
                >
                  ✕
                </button>
              </div>
            </div>
          }
        </div>

        <div class="border-t border-slate-200 pt-4 space-y-2">
          <div class="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span>\${{ subtotal().toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-slate-600">
            <span>IVA (19%):</span>
            <span>\${{ iva().toFixed(2) }}</span>
          </div>
          <div class="flex justify-between font-bold text-lg text-slate-800">
            <span>Total:</span>
            <span>\${{ total().toFixed(2) }}</span>
          </div>
        </div>
      }
    </div>
  `
})
export class CartComponent {
  items = input<CartItem[]>([]);
  itemRemoved = output<CartItem>();
  itemsChanged = output<CartItem[]>();

  subtotal = computed(() => 
    this.items().reduce((sum, item) => 
      sum + (item.product.precio * item.cantidad), 0
    )
  );

  iva = computed(() => this.subtotal() * 0.19);
  total = computed(() => this.subtotal() + this.iva());

  incrementQuantity(item: CartItem) {
    const updated = this.items().map(i => 
      i.product.id === item.product.id 
        ? { ...i, cantidad: i.cantidad + 1 }
        : i
    );
    this.itemsChanged.emit(updated);
  }

  decrementQuantity(item: CartItem) {
    if (item.cantidad > 1) {
      const updated = this.items().map(i => 
        i.product.id === item.product.id 
          ? { ...i, cantidad: i.cantidad - 1 }
          : i
      );
      this.itemsChanged.emit(updated);
    }
  }

  removeItem(item: CartItem) {
    this.itemRemoved.emit(item);
  }
}
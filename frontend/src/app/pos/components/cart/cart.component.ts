import { Component, input, output, computed } from '@angular/core';
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
      <header class="card-header">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 class="card-title">Carrito de compras</h3>
        </div>
        @if (items().length > 0) {
          <span class="badge-primary">{{ totalQty() }} {{ totalQty() === 1 ? 'item' : 'items' }}</span>
        }
      </header>

      @if (items().length === 0) {
        <div class="flex flex-col items-center justify-center py-10 text-center">
          <span class="flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 text-slate-400 mb-3">
            <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </span>
          <p class="text-sm font-medium text-slate-700">Carrito vacío</p>
          <p class="text-xs text-slate-500 mt-1">Agrega productos para empezar</p>
        </div>
      } @else {
        <ul class="divide-y divide-slate-100 mb-4 max-h-[420px] overflow-y-auto">
          @for (item of items(); track item.product.id) {
            <li class="flex items-start gap-3 py-3">
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm text-slate-800 truncate">{{ item.product.nombre }}</p>
                <p class="text-xs text-slate-500 mt-0.5">
                  &#36;{{ item.product.precio }} &middot; Stock: {{ item.product.stock }}
                </p>
                <p class="text-xs font-semibold text-primary-700 mt-1">
                  Subtotal: &#36;{{ (item.product.precio * item.cantidad).toFixed(2) }}
                </p>
              </div>
              <div class="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  (click)="decrementQuantity(item)"
                  [disabled]="item.cantidad <= 1"
                  class="w-8 h-8 inline-flex items-center justify-center rounded-md border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-colors"
                  [attr.aria-label]="'Disminuir cantidad de ' + item.product.nombre"
                >
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4" />
                  </svg>
                </button>
                <span
                  class="w-9 text-center text-sm font-semibold text-slate-800 tabular-nums"
                  aria-live="polite"
                >{{ item.cantidad }}</span>
                <button
                  type="button"
                  (click)="incrementQuantity(item)"
                  class="w-8 h-8 inline-flex items-center justify-center rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
                  [attr.aria-label]="'Aumentar cantidad de ' + item.product.nombre"
                >
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button
                  type="button"
                  (click)="removeItem(item)"
                  class="w-8 h-8 inline-flex items-center justify-center rounded-md text-red-500 hover:bg-red-50 transition-colors ml-1"
                  [attr.aria-label]="'Eliminar ' + item.product.nombre + ' del carrito'"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                  </svg>
                </button>
              </div>
            </li>
          }
        </ul>

        <div class="border-t border-slate-200 pt-4 space-y-2">
          <div class="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span class="tabular-nums">&#36;{{ subtotal().toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-sm text-slate-600">
            <span>IVA (19%)</span>
            <span class="tabular-nums">&#36;{{ iva().toFixed(2) }}</span>
          </div>
          <div class="flex justify-between items-baseline pt-2 border-t border-slate-100">
            <span class="text-sm font-medium text-slate-700">Total</span>
            <span class="text-xl font-bold text-slate-900 tabular-nums">&#36;{{ total().toFixed(2) }}</span>
          </div>
        </div>
      }
    </div>
  `,
})
export class CartComponent {
  items = input<CartItem[]>([]);
  itemRemoved = output<CartItem>();
  itemsChanged = output<CartItem[]>();

  subtotal = computed(() =>
    this.items().reduce((sum, item) => sum + item.product.precio * item.cantidad, 0),
  );

  iva = computed(() => this.subtotal() * 0.19);
  total = computed(() => this.subtotal() + this.iva());
  totalQty = computed(() => this.items().reduce((sum, item) => sum + item.cantidad, 0));

  incrementQuantity(item: CartItem) {
    const updated = this.items().map((i) =>
      i.product.id === item.product.id ? { ...i, cantidad: i.cantidad + 1 } : i,
    );
    this.itemsChanged.emit(updated);
  }

  decrementQuantity(item: CartItem) {
    if (item.cantidad > 1) {
      const updated = this.items().map((i) =>
        i.product.id === item.product.id ? { ...i, cantidad: i.cantidad - 1 } : i,
      );
      this.itemsChanged.emit(updated);
    }
  }

  removeItem(item: CartItem) {
    this.itemRemoved.emit(item);
  }
}

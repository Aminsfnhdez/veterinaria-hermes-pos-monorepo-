import { Component, inject, signal } from '@angular/core';
import { ProductSearchComponent } from '../product-search/product-search.component';
import { CartComponent, CartItem } from '../cart/cart.component';
import { ClientSelectComponent } from '../client-select/client-select.component';
import { SaleService } from '../../../shared/services/sale.service';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { AuthService } from '../../../shared/services/auth.service';
import { Product } from '../../../shared/models/product.model';
import { Client } from '../../../shared/models/client.model';
import { MetodoPago } from '../../../shared/models/invoice.model';

@Component({
  selector: 'app-sale-point',
  standalone: true,
  imports: [ProductSearchComponent, CartComponent, ClientSelectComponent],
  template: `
    <div class="p-4 sm:p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-900">Punto de Venta</h1>
        <p class="text-sm text-slate-500 mt-1">Agrega productos, selecciona el cliente y finaliza la venta.</p>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div class="xl:col-span-2 space-y-6">
          <section class="card">
            <header class="card-header">
              <div>
                <h2 class="card-title">Cliente</h2>
                <p class="card-subtitle">Selecciona o registra un cliente para asociar la venta</p>
              </div>
            </header>
            <app-client-select (clientSelected)="onClientSelected($event)" />
          </section>

          <section class="card">
            <header class="card-header">
              <div>
                <h2 class="card-title">Agregar productos</h2>
                <p class="card-subtitle">Busca por nombre o descripción</p>
              </div>
            </header>
            <app-product-search (productSelected)="onProductSelected($event)" />
          </section>

          @if (cartItems().length > 0 && selectedClient()) {
            <section class="card">
              <header class="card-header">
                <div>
                  <h2 class="card-title">Método de pago</h2>
                  <p class="card-subtitle">Elige cómo se pagará esta venta</p>
                </div>
              </header>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                @for (m of methods; track m.value) {
                  <button
                    type="button"
                    (click)="metodoPago = m.value"
                    [attr.aria-pressed]="metodoPago === m.value"
                    class="flex flex-col items-start gap-1 p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer"
                    [class.border-primary-600]="metodoPago === m.value"
                    [class.bg-primary-50]="metodoPago === m.value"
                    [class.ring-2]="metodoPago === m.value"
                    [class.ring-primary-200]="metodoPago === m.value"
                    [class.border-slate-200]="metodoPago !== m.value"
                    [class.hover:border-slate-300]="metodoPago !== m.value"
                    [class.hover:bg-slate-50]="metodoPago !== m.value"
                  >
                    <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">{{ m.label }}</span>
                    <span class="text-sm text-slate-700">{{ m.description }}</span>
                  </button>
                }
              </div>
            </section>
          }
        </div>

        <aside class="xl:col-span-1">
          <div class="xl:sticky xl:top-20 space-y-4">
            <app-cart
              [items]="cartItems()"
              (itemRemoved)="onItemRemoved($event)"
              (itemsChanged)="onItemsChanged($event)"
            />

            @if (cartItems().length > 0 && selectedClient()) {
              <button
                type="button"
                (click)="finalizeSale()"
                [disabled]="processing()"
                class="btn-primary btn-lg w-full"
                [attr.aria-busy]="processing()"
              >
                @if (processing()) {
                  <span class="spinner" aria-hidden="true"></span>
                  <span>Procesando venta...</span>
                } @else {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Finalizar venta</span>
                }
              </button>
            }

            @if (saleResult()) {
              <div class="alert-success">
                <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <div class="flex-1">
                  <p class="font-semibold">Venta realizada</p>
                  <p class="text-xs opacity-80 mt-0.5">ID: {{ saleResult()?.id }}</p>
                  <button
                    type="button"
                    (click)="generateInvoice()"
                    class="btn-primary btn-sm mt-3"
                  >
                    Generar factura
                  </button>
                </div>
              </div>
            }

            @if (invoiceResult()) {
              <div class="alert-info">
                <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                </svg>
                <div class="flex-1">
                  <p class="font-semibold">Factura generada</p>
                  <p class="text-xs opacity-80 mt-0.5">{{ invoiceResult()?.numeroFactura }}</p>
                  <button
                    type="button"
                    (click)="downloadInvoicePdf()"
                    class="btn-secondary btn-sm mt-3"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Descargar PDF
                  </button>
                </div>
              </div>
            }

            @if (error()) {
              <div class="alert-danger" role="alert" aria-live="polite">
                <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span>{{ error() }}</span>
              </div>
            }
          </div>
        </aside>
      </div>
    </div>
  `,
})
export class SalePointComponent {
  private saleService = inject(SaleService);
  private invoiceService = inject(InvoiceService);
  private authService = inject(AuthService);

  cartItems = signal<CartItem[]>([]);
  selectedClient = signal<Client | null>(null);
  metodoPago: MetodoPago = 'EFECTIVO';
  processing = signal(false);
  saleResult = signal<any>(null);
  invoiceResult = signal<any>(null);
  error = signal<string | null>(null);

  methods: { value: MetodoPago; label: string; description: string }[] = [
    { value: 'EFECTIVO', label: 'Efectivo', description: 'Pago en efectivo en caja' },
    { value: 'TARJETA', label: 'Tarjeta', description: 'Crédito o débito' },
    { value: 'TRANSFERENCIA', label: 'Transferencia', description: 'Pago por transferencia' },
  ];

  onProductSelected(product: Product) {
    const existing = this.cartItems().find((item) => item.product.id === product.id);

    if (existing) {
      this.cartItems.update((items) =>
        items.map((item) =>
          item.product.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item,
        ),
      );
    } else {
      this.cartItems.update((items) => [...items, { product, cantidad: 1 }]);
    }

    this.error.set(null);
    this.saleResult.set(null);
    this.invoiceResult.set(null);
  }

  onClientSelected(client: Client | null) {
    this.selectedClient.set(client);
  }

  onItemRemoved(item: CartItem) {
    this.cartItems.update((items) => items.filter((i) => i.product.id !== item.product.id));
  }

  onItemsChanged(items: CartItem[]) {
    this.cartItems.set(items);
  }

  finalizeSale() {
    if (!this.selectedClient()) {
      this.error.set('Selecciona un cliente');
      return;
    }

    if (this.cartItems().length === 0) {
      this.error.set('El carrito está vacío');
      return;
    }

    this.processing.set(true);
    this.error.set(null);

    const user = this.authService.user();
    if (!user) {
      this.error.set('Usuario no autenticado');
      this.processing.set(false);
      return;
    }

    const saleDto = {
      clienteId: this.selectedClient()!.id,
      usuarioId: user.id,
      items: this.cartItems().map((item) => ({
        productoId: item.product.id,
        cantidad: item.cantidad,
      })),
    };

    this.saleService.create(saleDto).subscribe({
      next: (sale) => {
        this.saleResult.set(sale);
        this.processing.set(false);
        this.cartItems.set([]);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al crear venta');
        this.processing.set(false);
      },
    });
  }

  generateInvoice() {
    const sale = this.saleResult();
    if (!sale) return;

    this.invoiceService
      .create({
        ventaId: sale.id,
        metodoPago: this.metodoPago,
      })
      .subscribe({
        next: (invoice) => {
          this.invoiceResult.set(invoice);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al generar factura');
        },
      });
  }

  downloadInvoicePdf() {
    const invoice = this.invoiceResult();
    if (!invoice) return;

    this.invoiceService.downloadPdf(invoice.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${invoice.numeroFactura}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.error.set('Error al descargar PDF');
      },
    });
  }
}

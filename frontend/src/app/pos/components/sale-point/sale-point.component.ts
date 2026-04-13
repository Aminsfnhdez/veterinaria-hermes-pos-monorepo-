import { Component, inject, signal, computed } from '@angular/core';
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
    <div class="flex h-full gap-6 p-6">
      <div class="flex-1 space-y-6">
        <div class="card">
          <h2 class="text-xl font-bold text-slate-800 mb-4">Nueva Venta</h2>
          
          <app-client-select (clientSelected)="onClientSelected($event)" />
        </div>

        <div class="card">
          <h3 class="font-semibold text-slate-800 mb-4">Agregar Producto</h3>
          <app-product-search (productSelected)="onProductSelected($event)" />
        </div>

        @if (cartItems().length > 0 && selectedClient()) {
          <div class="card">
            <h3 class="font-semibold text-slate-800 mb-4">Método de Pago</h3>
            <div class="flex gap-3">
              <button 
                (click)="metodoPago = 'EFECTIVO'"
                [class]="metodoPago === 'EFECTIVO' ? 'btn-primary' : 'btn-secondary'"
              >
                Efectivo
              </button>
              <button 
                (click)="metodoPago = 'TARJETA'"
                [class]="metodoPago === 'TARJETA' ? 'btn-primary' : 'btn-secondary'"
              >
                Tarjeta
              </button>
              <button 
                (click)="metodoPago = 'TRANSFERENCIA'"
                [class]="metodoPago === 'TRANSFERENCIA' ? 'btn-primary' : 'btn-secondary'"
              >
                Transferencia
              </button>
            </div>
          </div>
        }
      </div>

      <div class="w-96">
        <app-cart 
          [items]="cartItems()"
          (itemRemoved)="onItemRemoved($event)"
          (itemsChanged)="onItemsChanged($event)"
        />

        @if (cartItems().length > 0 && selectedClient()) {
          <button 
            (click)="finalizeSale()"
            [disabled]="processing()"
            class="btn-primary w-full mt-4 py-3 text-lg"
          >
            @if (processing()) {
              <span class="animate-spin mr-2">⟳</span>
              Procesando...
            } @else {
              Finalizar Venta
            }
          </button>
        }

        @if (saleResult()) {
          <div class="mt-4 p-4 bg-green-100 border border-green-400 rounded-lg">
            <p class="font-medium text-green-800">¡Venta realizada!</p>
            <p class="text-sm text-green-600">ID: {{ saleResult()?.id }}</p>
            <button 
              (click)="generateInvoice()"
              class="mt-2 btn-primary text-sm"
            >
              Generar Factura
            </button>
          </div>
        }

        @if (invoiceResult()) {
          <div class="mt-2 p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <p class="font-medium text-primary">Factura generada</p>
            <p class="text-sm text-slate-600">{{ invoiceResult()?.numeroFactura }}</p>
            <button 
              (click)="downloadInvoicePdf()"
              class="mt-2 btn-secondary text-sm"
            >
              Descargar PDF
            </button>
          </div>
        }

        @if (error()) {
          <div class="mt-4 p-4 bg-red-100 border border-red-400 rounded-lg">
            <p class="text-red-700">{{ error() }}</p>
          </div>
        }
      </div>
    </div>
  `
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

  onProductSelected(product: Product) {
    const existing = this.cartItems().find(item => item.product.id === product.id);
    
    if (existing) {
      this.cartItems.update(items => 
        items.map(item => 
          item.product.id === product.id 
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      );
    } else {
      this.cartItems.update(items => [...items, { product, cantidad: 1 }]);
    }
    
    this.error.set(null);
    this.saleResult.set(null);
    this.invoiceResult.set(null);
  }

  onClientSelected(client: Client | null) {
    this.selectedClient.set(client);
  }

  onItemRemoved(item: CartItem) {
    this.cartItems.update(items => items.filter(i => i.product.id !== item.product.id));
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
      items: this.cartItems().map(item => ({
        productoId: item.product.id,
        cantidad: item.cantidad
      }))
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
      }
    });
  }

  generateInvoice() {
    const sale = this.saleResult();
    if (!sale) return;

    this.invoiceService.create({
      ventaId: sale.id,
      metodoPago: this.metodoPago
    }).subscribe({
      next: (invoice) => {
        this.invoiceResult.set(invoice);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al generar factura');
      }
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
      }
    });
  }
}
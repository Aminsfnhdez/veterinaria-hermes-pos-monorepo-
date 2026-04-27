import { Component, inject, signal, OnInit, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { Factura } from '../../../shared/models/invoice.model';

@Component({
  selector: 'app-invoice-view',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="p-4 sm:p-6">
      <nav class="mb-4 text-sm" aria-label="Breadcrumb">
        <ol class="flex items-center gap-2 text-slate-500">
          <li>
            <a routerLink="/invoices" class="hover:text-slate-700 transition-colors flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Volver a facturas
            </a>
          </li>
        </ol>
      </nav>

      @if (loading()) {
        <div class="flex justify-center py-16">
          <svg
            aria-hidden="true"
            class="w-12 h-12 text-slate-200 animate-spin fill-primary-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        </div>
      } @else if (invoice()) {
        <div class="card max-w-3xl mx-auto p-0 overflow-hidden">
          <header class="px-6 sm:px-8 py-6 border-b border-slate-100 bg-gradient-to-br from-primary-50 to-white">
            <div class="flex items-start justify-between gap-4 flex-wrap">
              <div class="flex items-center gap-3">
                <span class="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-600 text-white shadow-sm">
                  <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C9.79 2 8 3.79 8 6c0 1.85 1.28 3.4 3 3.86V12H6c-1.66 0-3 1.34-3 3v2h2v-2c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v2h2v-2c0-1.66-1.34-3-3-3h-5V9.86c1.72-.46 3-2.01 3-3.86 0-2.21-1.79-4-4-4z"/>
                  </svg>
                </span>
                <div>
                  <h1 class="text-lg font-bold text-slate-900">Veterinaria Hermes</h1>
                  <p class="text-xs text-slate-500">Factura electrónica</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-xs uppercase tracking-wider text-slate-500 font-semibold">N° factura</p>
                <p class="text-xl font-bold text-slate-900 tabular-nums">{{ invoice()!.numeroFactura }}</p>
              </div>
            </div>
            @if (invoice()!.cufe) {
              <p class="text-[11px] text-slate-400 mt-3 break-all">CUFE: {{ invoice()!.cufe }}</p>
            }
          </header>

          <div class="px-6 sm:px-8 py-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 class="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Datos de la venta</h3>
                <dl class="space-y-1 text-sm">
                  <div class="flex gap-2">
                    <dt class="text-slate-500">Fecha:</dt>
                    <dd class="font-medium text-slate-800">{{ invoice()!.fechaEmision | date:'dd/MM/yyyy HH:mm' }}</dd>
                  </div>
                  <div class="flex gap-2 items-center">
                    <dt class="text-slate-500">Método:</dt>
                    <dd>
                      <span [class]="getMetodoBadgeClass(invoice()!.metodoPago)">
                        {{ getMetodoLabel(invoice()!.metodoPago) }}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 class="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Cliente</h3>
                @if (invoice()!.venta?.cliente) {
                  <dl class="space-y-1 text-sm">
                    <dd class="font-medium text-slate-800">{{ invoice()!.venta!.cliente!.nombre }}</dd>
                    <dd class="text-xs text-slate-500">{{ invoice()!.venta!.cliente!.identificacion }}</dd>
                    @if (invoice()!.venta!.cliente!.email) {
                      <dd class="text-xs text-slate-500">{{ invoice()!.venta!.cliente!.email }}</dd>
                    }
                  </dl>
                }
              </div>
            </div>

            <div class="mb-6">
              <h3 class="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">Productos</h3>
              <div class="rounded-lg border border-slate-200 overflow-hidden">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th class="text-center">Cant.</th>
                      <th class="text-right">P. unitario</th>
                      <th class="text-right">IVA</th>
                      <th class="text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of invoice()!.venta?.itemVentas; track item.id) {
                      <tr>
                        <td class="font-medium text-slate-800">{{ item.producto?.nombre || 'Producto' }}</td>
                        <td class="text-center text-slate-600 tabular-nums">{{ item.cantidad }}</td>
                        <td class="text-right text-slate-600 tabular-nums">&#36;{{ item.precioUnitario }}</td>
                        <td class="text-right text-slate-600 tabular-nums">&#36;{{ item.ivaItem }}</td>
                        <td class="text-right font-semibold text-slate-800 tabular-nums">&#36;{{ item.subtotal }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <div class="rounded-lg bg-slate-50 border border-slate-200 p-4">
              <div class="flex justify-between text-sm text-slate-600 mb-1">
                <span>Subtotal</span>
                <span class="tabular-nums">&#36;{{ invoice()!.venta?.subtotal || 0 }}</span>
              </div>
              <div class="flex justify-between text-sm text-slate-600 mb-2">
                <span>IVA (19%)</span>
                <span class="tabular-nums">&#36;{{ invoice()!.venta?.iva || 0 }}</span>
              </div>
              <div class="flex justify-between items-baseline pt-2 border-t border-slate-200">
                <span class="text-sm font-medium text-slate-700">Total</span>
                <span class="text-2xl font-bold text-primary-700 tabular-nums">&#36;{{ invoice()!.venta?.total || 0 }}</span>
              </div>
            </div>

            <div class="mt-6 flex justify-end gap-3">
              <a routerLink="/invoices" class="btn-secondary">Volver</a>
              <button (click)="downloadPdf()" class="btn-primary">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      } @else {
        <div class="card text-center py-12">
          <p class="text-slate-500">Factura no encontrada</p>
        </div>
      }
    </div>
  `,
})
export class InvoiceViewComponent implements OnInit {
  private invoiceService = inject(InvoiceService);

  invoiceId = input<string>();
  invoice = signal<Factura | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.loadInvoice();
  }

  loadInvoice() {
    this.loading.set(true);
    this.invoiceService.getById(this.invoiceId()!).subscribe({
      next: (invoice) => {
        this.invoice.set(invoice);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getMetodoLabel(metodo: string): string {
    switch (metodo) {
      case 'EFECTIVO':
        return 'Efectivo';
      case 'TARJETA':
        return 'Tarjeta';
      case 'TRANSFERENCIA':
        return 'Transferencia';
      default:
        return metodo;
    }
  }

  getMetodoBadgeClass(metodo: string): string {
    switch (metodo) {
      case 'EFECTIVO':
        return 'badge-success';
      case 'TARJETA':
        return 'badge-info';
      case 'TRANSFERENCIA':
        return 'badge-purple';
      default:
        return 'badge';
    }
  }

  downloadPdf() {
    const inv = this.invoice();
    if (!inv) return;

    this.invoiceService.downloadPdf(inv.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${inv.numeroFactura}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
    });
  }
}

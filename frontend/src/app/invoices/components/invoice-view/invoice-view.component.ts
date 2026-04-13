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
    <div class="p-6">
      <div class="flex items-center gap-4 mb-6">
        <a routerLink="/invoices" class="text-slate-600 hover:text-slate-800">
          ← Volver
        </a>
        <h1 class="text-2xl font-bold text-slate-800">Factura</h1>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin text-4xl">⟳</div>
        </div>
      } @else if (invoice()) {
        <div class="card max-w-3xl mx-auto">
          <div class="text-center border-b border-slate-200 pb-6 mb-6">
            <h2 class="text-2xl font-bold text-slate-800">Veterinaria Hermes</h2>
            <p class="text-slate-500">Factura Electrónica</p>
            <p class="text-lg font-semibold mt-2">{{ invoice()!.numeroFactura }}</p>
            @if (invoice()!.cufe) {
              <p class="text-xs text-slate-400 mt-1">CUFE: {{ invoice()!.cufe }}</p>
            }
          </div>

          <div class="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 class="font-semibold text-slate-700 mb-2">Datos de la Venta</h3>
              <p class="text-sm text-slate-600">Fecha: {{ invoice()!.fechaEmision | date:'dd/MM/yyyy HH:mm' }}</p>
              <p class="text-sm text-slate-600">Método: {{ getMetodoLabel(invoice()!.metodoPago) }}</p>
            </div>
            <div>
              <h3 class="font-semibold text-slate-700 mb-2">Cliente</h3>
              @if (invoice()!.venta?.cliente) {
                <p class="text-sm text-slate-600">{{ invoice()!.venta!.cliente!.nombre }}</p>
                <p class="text-sm text-slate-500">{{ invoice()!.venta!.cliente!.identificacion }}</p>
                @if (invoice()!.venta!.cliente!.email) {
                  <p class="text-sm text-slate-500">{{ invoice()!.venta!.cliente!.email }}</p>
                }
              }
            </div>
          </div>

          <div class="mb-6">
            <h3 class="font-semibold text-slate-700 mb-3">Productos</h3>
            <table class="w-full text-sm">
              <thead class="bg-slate-50">
                <tr>
                  <th class="px-3 py-2 text-left text-slate-600">Producto</th>
                  <th class="px-3 py-2 text-center text-slate-600">Cant.</th>
                  <th class="px-3 py-2 text-right text-slate-600">P.Unit</th>
                  <th class="px-3 py-2 text-right text-slate-600">IVA</th>
                  <th class="px-3 py-2 text-right text-slate-600">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                @for (item of invoice()!.venta?.itemVentas; track item.id) {
                  <tr class="border-t border-slate-100">
                    <td class="px-3 py-2">{{ item.producto?.nombre || 'Producto' }}</td>
                    <td class="px-3 py-2 text-center">{{ item.cantidad }}</td>
                    <td class="px-3 py-2 text-right">\${{ item.precioUnitario }}</td>
                    <td class="px-3 py-2 text-right">\${{ item.ivaItem }}</td>
                    <td class="px-3 py-2 text-right">\${{ item.subtotal }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="border-t border-slate-200 pt-4">
            <div class="flex justify-between text-slate-600 mb-1">
              <span>Subtotal:</span>
              <span>\${{ invoice()!.venta?.subtotal || 0 }}</span>
            </div>
            <div class="flex justify-between text-slate-600 mb-2">
              <span>IVA (19%):</span>
              <span>\${{ invoice()!.venta?.iva || 0 }}</span>
            </div>
            <div class="flex justify-between text-xl font-bold text-slate-800">
              <span>Total:</span>
              <span>\${{ invoice()!.venta?.total || 0 }}</span>
            </div>
          </div>

          <div class="mt-6 flex justify-center">
            <button (click)="downloadPdf()" class="btn-primary">
              Descargar PDF
            </button>
          </div>
        </div>
      } @else {
        <div class="text-center py-12 text-slate-500">
          Factura no encontrada
        </div>
      }
    </div>
  `
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
      }
    });
  }

  getMetodoLabel(metodo: string): string {
    switch (metodo) {
      case 'EFECTIVO': return 'Efectivo';
      case 'TARJETA': return 'Tarjeta';
      case 'TRANSFERENCIA': return 'Transferencia';
      default: return metodo;
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
      }
    });
  }
}
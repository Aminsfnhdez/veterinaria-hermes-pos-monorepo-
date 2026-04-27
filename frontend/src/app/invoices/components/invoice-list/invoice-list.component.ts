import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { Factura } from '../../../shared/models/invoice.model';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="p-4 sm:p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-900">Facturas</h1>
        <p class="text-sm text-slate-500 mt-1">Listado de facturas electrónicas emitidas</p>
      </div>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Fecha</th>
              <th>Venta</th>
              <th>Método</th>
              <th class="text-right">Total</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (invoice of invoices(); track invoice.id) {
              <tr>
                <td>
                  <span class="font-semibold text-slate-900 tabular-nums">{{ invoice.numeroFactura }}</span>
                </td>
                <td class="text-slate-600 text-xs">
                  {{ invoice.fechaEmision | date:'dd/MM/yyyy HH:mm' }}
                </td>
                <td>
                  <code class="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {{ invoice.ventaId.slice(0, 8) }}
                  </code>
                </td>
                <td>
                  <span [class]="getMetodoBadgeClass(invoice.metodoPago)">
                    {{ getMetodoLabel(invoice.metodoPago) }}
                  </span>
                </td>
                <td class="text-right font-semibold text-slate-900 tabular-nums">
                  &#36;{{ invoice.venta?.total || 0 }}
                </td>
                <td class="actions">
                  <div class="inline-flex items-center gap-3">
                    <a [routerLink]="['/invoices', invoice.id]" class="btn-link">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver
                    </a>
                    <button (click)="downloadPdf(invoice)" class="btn-link text-slate-600 hover:text-slate-900">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      PDF
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>

        @if (invoices().length === 0) {
          <div class="table-empty">
            <svg class="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="font-medium text-slate-700">Sin facturas</p>
            <p class="text-xs text-slate-500 mt-1">Las facturas generadas aparecerán aquí</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class InvoiceListComponent implements OnInit {
  private invoiceService = inject(InvoiceService);

  invoices = signal<Factura[]>([]);

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.invoiceService.getAll().subscribe({
      next: (invoices) => this.invoices.set(invoices),
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

  downloadPdf(invoice: Factura) {
    this.invoiceService.downloadPdf(invoice.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${invoice.numeroFactura}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
    });
  }
}

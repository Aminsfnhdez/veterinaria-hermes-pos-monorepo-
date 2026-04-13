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
    <div class="p-6">
      <h1 class="text-2xl font-bold text-slate-800 mb-6">Facturas</h1>

      <div class="card overflow-hidden p-0">
        <table class="w-full">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-600">Número</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-600">Fecha</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-600">Venta ID</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-600">Método</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-600">Total</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (invoice of invoices(); track invoice.id) {
              <tr class="border-t border-slate-100 hover:bg-slate-50">
                <td class="px-4 py-3 font-medium text-slate-800">{{ invoice.numeroFactura }}</td>
                <td class="px-4 py-3 text-slate-600">{{ invoice.fechaEmision | date:'dd/MM/yyyy HH:mm' }}</td>
                <td class="px-4 py-3 text-slate-500 text-sm">{{ invoice.ventaId.slice(0,8) }}...</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 rounded text-xs bg-slate-100 text-slate-600">
                    {{ getMetodoLabel(invoice.metodoPago) }}
                  </span>
                </td>
                <td class="px-4 py-3 font-medium text-slate-800">
                  \${{ invoice.venta?.total || 0 }}
                </td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <a [routerLink]="['/invoices', invoice.id]" class="text-primary hover:underline text-sm">
                      Ver
                    </a>
                    <button (click)="downloadPdf(invoice)" class="text-slate-600 hover:text-slate-800 text-sm">
                      PDF
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>

        @if (invoices().length === 0) {
          <p class="text-center py-8 text-slate-500">No hay facturas</p>
        }
      </div>
    </div>
  `
})
export class InvoiceListComponent implements OnInit {
  private invoiceService = inject(InvoiceService);

  invoices = signal<Factura[]>([]);

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.invoiceService.getAll().subscribe({
      next: (invoices) => this.invoices.set(invoices)
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

  downloadPdf(invoice: Factura) {
    this.invoiceService.downloadPdf(invoice.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${invoice.numeroFactura}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }
}
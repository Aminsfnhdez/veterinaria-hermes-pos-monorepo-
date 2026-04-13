import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Factura, CreateInvoiceDto } from '../models/invoice.model';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  create(dto: CreateInvoiceDto): Observable<Factura> {
    return this.http.post<Factura>(`${this.baseUrl}/invoices`, dto);
  }

  getAll(): Observable<Factura[]> {
    return this.http.get<Factura[]>(`${this.baseUrl}/invoices`);
  }

  getById(id: string): Observable<Factura> {
    return this.http.get<Factura>(`${this.baseUrl}/invoices/${id}`);
  }

  getByVenta(ventaId: string): Observable<Factura> {
    return this.http.get<Factura>(`${this.baseUrl}/invoices/by-venta/${ventaId}`);
  }

  downloadPdf(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/invoices/${id}/pdf`, {
      responseType: 'blob'
    });
  }
}
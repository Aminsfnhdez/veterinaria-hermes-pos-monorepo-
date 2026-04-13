import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Venta, CreateSaleDto } from '../models/sale.model';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  create(dto: CreateSaleDto): Observable<Venta> {
    return this.http.post<Venta>(`${this.baseUrl}/sales`, dto);
  }

  getAll(): Observable<Venta[]> {
    return this.http.get<Venta[]>(`${this.baseUrl}/sales`);
  }

  getById(id: string): Observable<Venta> {
    return this.http.get<Venta>(`${this.baseUrl}/sales/${id}`);
  }

  cancel(id: string): Observable<Venta> {
    return this.http.patch<Venta>(`${this.baseUrl}/sales/${id}/cancel`, {});
  }
}
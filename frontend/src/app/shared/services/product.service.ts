import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Product, CreateProductDto, UpdateProductDto } from '../models/product.model';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products`);
  }

  getById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }

  create(dto: CreateProductDto): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/products`, dto);
  }

  update(id: string, dto: UpdateProductDto): Observable<Product> {
    return this.http.patch<Product>(`${this.baseUrl}/products/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/products/${id}`);
  }

  getLowStock(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products/low-stock`);
  }

  getExpiringSoon(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products/expiring-soon`);
  }

  getExpired(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products/expired`);
  }
}
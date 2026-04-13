import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Client, CreateClientDto, UpdateClientDto } from '../models/client.model';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getAll(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.baseUrl}/clients`);
  }

  getById(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.baseUrl}/clients/${id}`);
  }

  create(dto: CreateClientDto): Observable<Client> {
    return this.http.post<Client>(`${this.baseUrl}/clients`, dto);
  }

  update(id: string, dto: UpdateClientDto): Observable<Client> {
    return this.http.patch<Client>(`${this.baseUrl}/clients/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/clients/${id}`);
  }
}
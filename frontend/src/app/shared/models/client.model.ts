export interface Client {
  id: string;
  nombre: string;
  identificacion: string;
  telefono?: string;
  email?: string;
  nombreMascota?: string;
  tipoMascota?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClientDto {
  nombre: string;
  identificacion: string;
  telefono?: string;
  email?: string;
  nombreMascota?: string;
  tipoMascota?: string;
}

export interface UpdateClientDto {
  nombre?: string;
  identificacion?: string;
  telefono?: string;
  email?: string;
  nombreMascota?: string;
  tipoMascota?: string;
}
import { Product } from './product.model';
import { Client } from './client.model';
import { User } from './user.model';

export type EstadoVenta = 'PENDIENTE' | 'COMPLETADA' | 'ANULADA';

export interface SaleItem {
  id: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  ivaItem: number;
  productoId: string;
  producto?: Product;
  ventaId: string;
}

export interface Venta {
  id: string;
  fecha: string;
  subtotal: number;
  iva: number;
  total: number;
  estado: EstadoVenta;
  clienteId: string;
  cliente?: Client;
  usuarioId: string;
  usuario?: User;
  itemVentas: SaleItem[];
}

export interface CreateSaleItemDto {
  productoId: string;
  cantidad: number;
}

export interface CreateSaleDto {
  clienteId: string;
  usuarioId: string;
  items: CreateSaleItemDto[];
}
import { Venta } from './sale.model';

export type MetodoPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';

export interface Factura {
  id: string;
  numeroFactura: string;
  metodoPago: MetodoPago;
  cufe?: string;
  fechaEmision: string;
  ventaId: string;
  venta?: Venta;
}

export interface CreateInvoiceDto {
  ventaId: string;
  metodoPago: MetodoPago;
}
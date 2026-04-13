export type CategoriaProducto = 'MEDICAMENTO' | 'ALIMENTO' | 'ACCESORIO';

export interface Product {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria: CategoriaProducto;
  precio: number;
  stock: number;
  stockMinimo: number;
  lote?: string;
  fechaCaducidad?: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductDto {
  nombre: string;
  descripcion?: string;
  categoria: CategoriaProducto;
  precio: number;
  stock?: number;
  stockMinimo?: number;
  lote?: string;
  fechaCaducidad?: string;
}

export interface UpdateProductDto {
  nombre?: string;
  descripcion?: string;
  categoria?: CategoriaProducto;
  precio?: number;
  stock?: number;
  stockMinimo?: number;
  lote?: string;
  fechaCaducidad?: string;
  activo?: boolean;
}
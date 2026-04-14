import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { CategoriaProducto } from '../entities/product';

export class CreateProductDto {
  @ApiProperty({
    example: 'Amoxicilina 500mg',
    description: 'Nombre del producto',
  })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiPropertyOptional({
    example: 'Antibiótico de amplio espectro',
    description: 'Descripción del producto',
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    enum: CategoriaProducto,
    example: 'MEDICAMENTO',
    description: 'Categoría del producto',
  })
  @IsEnum(CategoriaProducto)
  @IsNotEmpty()
  categoria!: CategoriaProducto;

  @ApiProperty({
    example: 25000,
    description: 'Precio unitario (IVA incluido)',
  })
  @IsNumber()
  @IsNotEmpty()
  precio!: number;

  @ApiPropertyOptional({ example: 50, description: 'Stock actual' })
  @IsNumber()
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Stock mínimo para alertas',
  })
  @IsNumber()
  @IsOptional()
  stockMinimo?: number;

  @ApiPropertyOptional({
    example: 'LOTE-2024-001',
    description: 'Número de lote (obligatorio para medicamentos)',
  })
  @IsString()
  @IsOptional()
  lote?: string;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Fecha de caducidad (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsOptional()
  fechaCaducidad?: Date;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Amoxicilina 500mg' })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({ example: 'Antibiótico de amplio espectro' })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({ enum: CategoriaProducto })
  @IsEnum(CategoriaProducto)
  @IsOptional()
  categoria?: CategoriaProducto;

  @ApiPropertyOptional({ example: 25000 })
  @IsNumber()
  @IsOptional()
  precio?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsNumber()
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @IsOptional()
  stockMinimo?: number;

  @ApiPropertyOptional({ example: 'LOTE-2024-001' })
  @IsString()
  @IsOptional()
  lote?: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsDateString()
  @IsOptional()
  fechaCaducidad?: Date;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  activo?: boolean;
}

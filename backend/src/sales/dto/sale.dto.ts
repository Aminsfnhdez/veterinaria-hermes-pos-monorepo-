import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSaleItemDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID del producto',
  })
  @IsUUID()
  @IsNotEmpty()
  productoId!: string;

  @ApiProperty({ example: 2, description: 'Cantidad a comprar' })
  @IsNumber()
  @IsNotEmpty()
  cantidad!: number;
}

export class CreateSaleDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID del cliente',
  })
  @IsUUID()
  @IsNotEmpty()
  clienteId!: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID del usuario que realiza la venta',
  })
  @IsUUID()
  @IsNotEmpty()
  usuarioId!: string;

  @ApiProperty({ type: [CreateSaleItemDto], description: 'Items de la venta' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items!: CreateSaleItemDto[];
}

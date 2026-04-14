import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsUUID } from 'class-validator';
import { MetodoPago } from '../entities/factura';

export class CreateInvoiceDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID de la venta',
  })
  @IsUUID()
  @IsNotEmpty()
  ventaId!: string;

  @ApiProperty({
    enum: MetodoPago,
    example: 'EFECTIVO',
    description: 'Método de pago utilizado',
  })
  @IsEnum(MetodoPago)
  @IsNotEmpty()
  metodoPago!: MetodoPago;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre del cliente' })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiProperty({
    example: '12345678',
    description: 'Número de identificación (único)',
  })
  @IsString()
  @IsNotEmpty()
  identificacion!: string;

  @ApiPropertyOptional({
    example: '3001234567',
    description: 'Teléfono de contacto',
  })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({
    example: 'juan@email.com',
    description: 'Correo electrónico',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'Max', description: 'Nombre de la mascota' })
  @IsString()
  @IsOptional()
  nombreMascota?: string;

  @ApiPropertyOptional({ example: 'Perro', description: 'Tipo de mascota' })
  @IsString()
  @IsOptional()
  tipoMascota?: string;
}

export class UpdateClientDto {
  @ApiPropertyOptional({ example: 'Juan Pérez' })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({ example: '3001234567' })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({ example: 'juan@email.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'Max' })
  @IsString()
  @IsOptional()
  nombreMascota?: string;

  @ApiPropertyOptional({ example: 'Perro' })
  @IsString()
  @IsOptional()
  tipoMascota?: string;
}

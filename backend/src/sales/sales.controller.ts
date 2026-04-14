import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/sale.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('sales')
@ApiBearerAuth('JWT-auth')
@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Roles('ADMIN', 'VENDEDOR')
  @ApiOperation({
    summary: 'Crear nueva venta',
    description:
      'Crea una nueva venta con items. Calcula IVA 19% automáticamente. Usa SELECT FOR UPDATE para integridad de stock.',
  })
  @ApiResponse({ status: 201, description: 'Venta creada exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'Stock insuficiente o datos inválidos',
  })
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.createSale(createSaleDto);
  }

  @Get()
  @Roles('ADMIN', 'VENDEDOR')
  @ApiOperation({ summary: 'Listar todas las ventas' })
  @ApiResponse({ status: 200, description: 'Lista de ventas' })
  findAll() {
    return this.salesService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'VENDEDOR')
  @ApiOperation({ summary: 'Obtener una venta por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la venta', type: 'string' })
  @ApiResponse({ status: 200, description: 'Venta encontrada' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.findOne(id);
  }

  @Patch(':id/cancel')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Cancelar venta',
    description: 'Cambia estado a ANULADA. No restaura stock automáticamente.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la venta', type: 'string' })
  @ApiResponse({ status: 200, description: 'Venta cancelada' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.cancel(id);
  }
}

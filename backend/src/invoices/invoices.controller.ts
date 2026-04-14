import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/invoice.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('invoices')
@ApiBearerAuth('JWT-auth')
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @Roles('ADMIN', 'VENDEDOR')
  @ApiOperation({
    summary: 'Crear factura',
    description:
      'Genera una factura electrónica simulada para una venta existente. Usa SEQUENCE para número de factura atómico.',
  })
  @ApiResponse({ status: 201, description: 'Factura creada exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'Venta no encontrada o ya facturada',
  })
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.generate(createInvoiceDto);
  }

  @Get()
  @Roles('ADMIN', 'VENDEDOR')
  @ApiOperation({ summary: 'Listar todas las facturas' })
  @ApiResponse({ status: 200, description: 'Lista de facturas' })
  findAll() {
    return this.invoicesService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'VENDEDOR')
  @ApiOperation({ summary: 'Obtener una factura por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la factura', type: 'string' })
  @ApiResponse({ status: 200, description: 'Factura encontrada' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.invoicesService.findOne(id);
  }

  @Get(':id/pdf')
  @Roles('ADMIN', 'VENDEDOR')
  @ApiOperation({
    summary: 'Descargar PDF de factura',
    description:
      'Genera y descarga PDF de la factura en formato buffer (compatible con Vercel serverless)',
  })
  @ApiParam({ name: 'id', description: 'UUID de la factura', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'PDF de factura',
    content: {
      'application/pdf': { schema: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  async generatePdf(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const { pdfBuffer, numeroFactura } =
      await this.invoicesService.generatePdf(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${numeroFactura}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  @Get('by-venta/:ventaId')
  @Roles('ADMIN', 'VENDEDOR')
  @ApiOperation({ summary: 'Obtener factura por ID de venta' })
  @ApiParam({
    name: 'ventaId',
    description: 'UUID de la venta',
    type: 'string',
  })
  @ApiResponse({ status: 200, description: 'Factura encontrada' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  findByVenta(@Param('ventaId', ParseUUIDPipe) ventaId: string) {
    return this.invoicesService.findByVenta(ventaId);
  }
}

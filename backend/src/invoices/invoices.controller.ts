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
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import type { CreateInvoiceDto } from './invoices.service';

@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @Roles('ADMIN', 'VENDEDOR')
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.generate(createInvoiceDto);
  }

  @Get()
  @Roles('ADMIN', 'VENDEDOR')
  findAll() {
    return this.invoicesService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'VENDEDOR')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.invoicesService.findOne(id);
  }

  @Get(':id/pdf')
  @Roles('ADMIN', 'VENDEDOR')
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
  findByVenta(@Param('ventaId', ParseUUIDPipe) ventaId: string) {
    return this.invoicesService.findByVenta(ventaId);
  }
}

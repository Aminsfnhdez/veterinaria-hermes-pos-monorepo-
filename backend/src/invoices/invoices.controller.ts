import { Controller, Get, Post, Body, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import type { CreateInvoiceDto } from './invoices.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

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

  @Get('by-venta/:ventaId')
  @Roles('ADMIN', 'VENDEDOR')
  findByVenta(@Param('ventaId', ParseUUIDPipe) ventaId: string) {
    return this.invoicesService.findByVenta(ventaId);
  }
}
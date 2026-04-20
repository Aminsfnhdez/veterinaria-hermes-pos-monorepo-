import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Factura } from './entities/factura';
import { Venta } from '../sales/entities/venta';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { PdfKitGeneratorService } from './pdf-kit-generator.service';

@Module({
  imports: [TypeOrmModule.forFeature([Factura, Venta])],
  providers: [InvoicesService, PdfKitGeneratorService],
  controllers: [InvoicesController],
  exports: [InvoicesService],
})
export class InvoicesModule {}

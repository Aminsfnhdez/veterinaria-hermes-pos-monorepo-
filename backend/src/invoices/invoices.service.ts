import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Factura, MetodoPago } from './entities/factura';
import { Venta } from '../sales/entities/venta';
import { createHash } from 'crypto';
import { PdfKitGeneratorService } from './pdf-kit-generator.service';

export interface CreateInvoiceDto {
  ventaId: string;
  metodoPago: MetodoPago;
}

export interface GeneratePdfResponse {
  pdfBuffer: Buffer;
  numeroFactura: string;
  cufe: string;
}

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Factura)
    private readonly facturaRepository: Repository<Factura>,
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    private readonly dataSource: DataSource,
    private readonly pdfGenerator: PdfKitGeneratorService,
  ) {}

  private generateCufe(
    ventaId: string,
    numeroFactura: string,
    fecha: Date,
  ): string {
    const data = `${numeroFactura}${ventaId}${fecha.toISOString()}VeterinariaHermes`;
    return createHash('sha256').update(data).digest('hex').substring(0, 96);
  }

  async generateInvoiceNumber(): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const result = await queryRunner.query(
        "SELECT nextval('facturas_seq') as next_val",
      );
      const sequence = Number(result[0].next_val).toString().padStart(6, '0');
      const year = new Date().getFullYear();
      return `FE-${year}-${sequence}`;
    } finally {
      await queryRunner.release();
    }
  }

  async generatePdf(invoiceId: string): Promise<GeneratePdfResponse> {
    const factura = await this.facturaRepository.findOne({
      where: { id: invoiceId },
      relations: [
        'venta',
        'venta.itemVentas',
        'venta.itemVentas.producto',
        'venta.cliente',
        'venta.usuario',
      ],
    });

    if (!factura) {
      throw new NotFoundException(`Factura con ID ${invoiceId} no encontrada`);
    }

    if (factura.venta.estado === 'ANULADA') {
      throw new ConflictException('No se puede generar PDF para venta anulada');
    }

    const { numeroFactura, cufe } = factura;

    // Crear documento PDF
    const doc = this.pdfGenerator.createDocument({ size: 'A4', margin: 50 });
    const buffers: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));

    // Encabezado
    doc.fontSize(20).text('VETERINARIA HERMES', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text('Factura Electrónica', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Número: ${numeroFactura}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`CUFE: ${cufe}`, { align: 'center' });
    doc.moveDown(2);

    // Información de la venta
    doc.fontSize(14).text('Datos de la Venta', { underline: true });
    doc.moveDown();
    doc
      .fontSize(10)
      .text(`Fecha: ${factura.fechaEmision.toLocaleDateString()}`);
    doc.text(`Cliente: ${factura.venta.cliente.nombre}`);
    doc.text(`Identificación: ${factura.venta.cliente.identificacion}`);
    if (factura.venta.cliente.email) {
      doc.text(`Email: ${factura.venta.cliente.email}`);
    }
    if (factura.venta.cliente.telefono) {
      doc.text(`Teléfono: ${factura.venta.cliente.telefono}`);
    }
    doc.text(`Vendedor: ${factura.venta.usuario.nombre}`);
    doc.text(`Método de pago: ${factura.metodoPago}`);
    doc.moveDown(2);

    // Detalles de productos
    doc.fontSize(14).text('Detalles de Productos', { underline: true });
    doc.moveDown();

    const tableTop = doc.y;
    doc.fontSize(10);
    doc.text('Producto', 50, tableTop, { width: 200 });
    doc.text('Cant.', 250, tableTop, { width: 50, align: 'center' });
    doc.text('P.Unit.', 310, tableTop, { width: 80, align: 'right' });
    doc.text('IVA', 400, tableTop, { width: 70, align: 'right' });
    doc.text('Subtotal', 480, tableTop, { width: 70, align: 'right' });
    doc.moveDown();
    doc
      .strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    let yPosition = tableTop + 25;
    for (const item of factura.venta.itemVentas) {
      const nombre =
        item.producto.nombre.length > 25
          ? item.producto.nombre.substring(0, 22) + '...'
          : item.producto.nombre;
      doc.text(nombre, 50, yPosition, { width: 200 });
      doc.text(item.cantidad.toString(), 250, yPosition, {
        width: 50,
        align: 'center',
      });
      doc.text(`$${Number(item.precioUnitario).toFixed(2)}`, 310, yPosition, {
        width: 80,
        align: 'right',
      });
      doc.text(`$${Number(item.ivaItem).toFixed(2)}`, 400, yPosition, {
        width: 70,
        align: 'right',
      });
      doc.text(`$${Number(item.subtotal).toFixed(2)}`, 480, yPosition, {
        width: 70,
        align: 'right',
      });
      yPosition += 18;
    }

    doc.moveDown(2);
    doc
      .strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(50, yPosition)
      .lineTo(550, yPosition)
      .stroke();

    doc.fontSize(12);
    yPosition += 15;
    doc.text('Subtotal:', 350, yPosition, { width: 100, align: 'right' });
    doc.text(`$${Number(factura.venta.subtotal).toFixed(2)}`, 480, yPosition, {
      width: 70,
      align: 'right',
    });
    yPosition += 18;
    doc.text('IVA (19%):', 350, yPosition, { width: 100, align: 'right' });
    doc.text(`$${Number(factura.venta.iva).toFixed(2)}`, 480, yPosition, {
      width: 70,
      align: 'right',
    });
    yPosition += 20;
    doc.fontSize(14);
    doc.text('TOTAL A PAGAR:', 350, yPosition, { width: 100, align: 'right' });
    doc.text(`$${Number(factura.venta.total).toFixed(2)}`, 480, yPosition, {
      width: 70,
      align: 'right',
    });

    // Pie de página
    doc.moveDown(4);
    doc
      .fontSize(8)
      .text('Documento generado electrónicamente - Veterinaria Hermes', {
        align: 'center',
      });
    doc.text('Sistema POS - Facturación Electrónica DIAN (Simulada)', {
      align: 'center',
    });

    doc.end();

    await new Promise<void>((resolve) => {
      doc.on('end', () => resolve());
    });

    const pdfBuffer = Buffer.concat(buffers);

    const finalCufe = cufe ?? '';
    return { pdfBuffer, numeroFactura, cufe: finalCufe };
  }

  async generate(createInvoiceDto: CreateInvoiceDto): Promise<Factura> {
    const { ventaId, metodoPago } = createInvoiceDto;

    const venta = await this.ventaRepository.findOne({
      where: { id: ventaId },
    });
    if (!venta) {
      throw new NotFoundException(`Venta con ID ${ventaId} no encontrada`);
    }

    const existingInvoice = await this.facturaRepository.findOne({
      where: { ventaId },
    });
    if (existingInvoice) {
      throw new ConflictException(
        `La venta ${ventaId} ya tiene una factura asociada`,
      );
    }

    const numeroFactura = await this.generateInvoiceNumber();
    const cufe = this.generateCufe(ventaId, numeroFactura, new Date());

    const factura = this.facturaRepository.create({
      numeroFactura,
      metodoPago,
      cufe,
      ventaId,
      fechaEmision: new Date(),
    });

    return this.facturaRepository.save(factura);
  }

  async findAll(): Promise<Factura[]> {
    return this.facturaRepository.find({
      relations: ['venta'],
      order: { fechaEmision: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Factura> {
    const factura = await this.facturaRepository.findOne({
      where: { id },
      relations: ['venta'],
    });

    if (!factura) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    }

    return factura;
  }

  async findByVenta(ventaId: string): Promise<Factura> {
    const factura = await this.facturaRepository.findOne({
      where: { ventaId },
      relations: ['venta'],
    });

    if (!factura) {
      throw new NotFoundException(
        `Factura para venta ${ventaId} no encontrada`,
      );
    }

    return factura;
  }
}

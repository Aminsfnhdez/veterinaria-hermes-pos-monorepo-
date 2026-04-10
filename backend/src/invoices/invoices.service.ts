import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Factura, MetodoPago } from './entities/factura';
import { Venta } from '../sales/entities/venta';
import { randomBytes, createHash } from 'crypto';

export interface CreateInvoiceDto {
  ventaId: string;
  metodoPago: MetodoPago;
}

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Factura)
    private readonly facturaRepository: Repository<Factura>,
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
  ) {}

  private generateCufe(ventaId: string, fecha: Date): string {
    const data = `${ventaId}${fecha.toISOString()} VeterinariaHermes`;
    return createHash('sha256').update(data).digest('hex').substring(0, 64);
  }

  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.facturaRepository.count();
    const sequence = String(count + 1).padStart(6, '0');
    return `FE-${year}-${sequence}`;
  }

  async generate(createInvoiceDto: CreateInvoiceDto): Promise<Factura> {
    const { ventaId, metodoPago } = createInvoiceDto;

    const venta = await this.ventaRepository.findOne({ where: { id: ventaId } });
    if (!venta) {
      throw new NotFoundException(`Venta con ID ${ventaId} no encontrada`);
    }

    const existingInvoice = await this.facturaRepository.findOne({
      where: { ventaId },
    });
    if (existingInvoice) {
      throw new ConflictException(`La venta ${ventaId} ya tiene una factura asociada`);
    }

    const numeroFactura = await this.generateInvoiceNumber();
    const cufe = this.generateCufe(ventaId, new Date());

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
      throw new NotFoundException(`Factura para venta ${ventaId} no encontrada`);
    }

    return factura;
  }
}
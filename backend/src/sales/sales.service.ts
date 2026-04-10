import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Venta, ItemVenta, EstadoVenta } from './entities';
import { Product } from '../products/entities/product';

export interface CreateSaleItemDto {
  productoId: string;
  cantidad: number;
}

export interface CreateSaleDto {
  clienteId: string;
  usuarioId: string;
  items: CreateSaleItemDto[];
}

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(ItemVenta)
    private readonly itemVentaRepository: Repository<ItemVenta>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  async createSale(createSaleDto: CreateSaleDto): Promise<Venta> {
    const { clienteId, usuarioId, items } = createSaleDto;

    if (!items || items.length === 0) {
      throw new ConflictException('La venta debe tener al menos un producto');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let subtotal = 0;
      const ventaItems: { producto: Product; cantidad: number; precioUnitario: number; subtotal: number; ivaItem: number }[] = [];

      for (const item of items) {
        const producto = await queryRunner.manager.findOne(Product, {
          where: { id: item.productoId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!producto) {
          throw new NotFoundException(`Producto con ID ${item.productoId} no encontrado`);
        }

        if (!producto.activo) {
          throw new ConflictException(`El producto "${producto.nombre}" ya no está activo`);
        }

        if (producto.fechaCaducidad && producto.fechaCaducidad <= new Date()) {
          throw new ConflictException(`El producto "${producto.nombre}" está vencido y no puede ser vendido`);
        }

        if (producto.stock < item.cantidad) {
          throw new ConflictException(`Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}, solicitado: ${item.cantidad}`);
        }

        const itemSubtotal = Number(producto.precio) * item.cantidad;
        const itemIva = itemSubtotal * 0.19;

        subtotal += itemSubtotal;

        ventaItems.push({
          producto,
          cantidad: item.cantidad,
          precioUnitario: Number(producto.precio),
          subtotal: itemSubtotal,
          ivaItem: itemIva,
        });
      }

      const iva = subtotal * 0.19;
      const total = subtotal + iva;

      const venta = queryRunner.manager.create(Venta, {
        clienteId,
        usuarioId,
        subtotal,
        iva,
        total,
        estado: EstadoVenta.COMPLETADA,
        fecha: new Date(),
      });

      const savedVenta = await queryRunner.manager.save(Venta, venta);

      for (const item of ventaItems) {
        const itemVenta = queryRunner.manager.create(ItemVenta, {
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          subtotal: item.subtotal,
          ivaItem: item.ivaItem,
          productoId: item.producto.id,
          ventaId: savedVenta.id,
        });

        await queryRunner.manager.save(ItemVenta, itemVenta);

        await queryRunner.manager.update(
          Product,
          { id: item.producto.id },
          { stock: item.producto.stock - item.cantidad },
        );
      }

      await queryRunner.commitTransaction();

      return this.ventaRepository.findOne({
        where: { id: savedVenta.id },
        relations: ['itemVentas', 'cliente', 'usuario'],
      }) as Promise<Venta>;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Venta[]> {
    return this.ventaRepository.find({
      relations: ['itemVentas', 'cliente', 'usuario'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Venta> {
    const venta = await this.ventaRepository.findOne({
      where: { id },
      relations: ['itemVentas', 'cliente', 'usuario'],
    });

    if (!venta) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    return venta;
  }

  async cancel(id: string): Promise<Venta> {
    const venta = await this.findOne(id);

    if (venta.estado === EstadoVenta.ANULADA) {
      throw new ConflictException('La venta ya está anulada');
    }

    if (venta.estado === EstadoVenta.PENDIENTE) {
      throw new ConflictException('No se puede anular una venta pendiente');
    }

    venta.estado = EstadoVenta.ANULADA;
    return this.ventaRepository.save(venta);
  }
}
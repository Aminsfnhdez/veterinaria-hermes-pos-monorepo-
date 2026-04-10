import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { Venta } from './venta';
import { Product } from '../../products/entities/product';

@Entity('item_venta')
@Check('"cantidad" > 0')
export class ItemVenta {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  cantidad!: number;

  @Column({ name: 'precio_unitario', type: 'decimal', precision: 10, scale: 2 })
  precioUnitario!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal!: number;

  @Column({ name: 'iva_item', type: 'decimal', precision: 10, scale: 2 })
  ivaItem!: number;

  @Column({ name: 'producto_id' })
  productoId!: string;

  @Column({ name: 'venta_id' })
  ventaId!: string;

  @ManyToOne(() => Product, (producto) => producto.itemVentas)
  @JoinColumn({ name: 'producto_id' })
  producto!: Product;

  @ManyToOne(() => Venta, (venta) => venta.itemVentas)
  @JoinColumn({ name: 'venta_id' })
  venta!: Venta;
}

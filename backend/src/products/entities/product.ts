import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Check,
} from 'typeorm';
import { ItemVenta } from '../../sales/entities/itemVenta';

export enum CategoriaProducto {
  MEDICAMENTO = 'MEDICAMENTO',
  ALIMENTO = 'ALIMENTO',
  ACCESORIO = 'ACCESORIO',
}

@Entity('producto')
@Check('"stock" >= 0')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'enum', enum: CategoriaProducto })
  categoria!: CategoriaProducto;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio!: number;

  @Column({ default: 0 })
  stock!: number;

  @Column({ name: 'stock_minimo', default: 0 })
  stockMinimo!: number;

  @Column({ nullable: true })
  lote?: string;

  @Column({ name: 'fecha_caducidad', type: 'date', nullable: true })
  fechaCaducidad?: Date;

  @Column({ default: true })
  activo!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => ItemVenta, (item) => item.producto)
  itemVentas!: ItemVenta[];
}

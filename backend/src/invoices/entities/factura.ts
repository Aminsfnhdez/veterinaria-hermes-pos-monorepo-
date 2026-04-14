import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Venta } from '../../sales/entities/venta';

export enum MetodoPago {
  EFECTIVO = 'EFECTIVO',
  TARJETA = 'TARJETA',
  TRANSFERENCIA = 'TRANSFERENCIA',
}

@Entity('factura')
export class Factura {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'numero_factura', unique: true })
  numeroFactura!: string;

  @Column({
    name: 'fecha_emision',
    type: 'timestamptz',
    default: () => 'now()',
  })
  fechaEmision!: Date;

  @Column({
    name: 'metodo_pago',
    type: 'enum',
    enum: MetodoPago,
  })
  metodoPago!: MetodoPago;

  @Column({ nullable: true })
  cufe?: string;

  @Column({ name: 'venta_id', unique: true })
  ventaId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToOne(() => Venta, (venta) => venta.factura)
  @JoinColumn({ name: 'venta_id' })
  venta!: Venta;
}

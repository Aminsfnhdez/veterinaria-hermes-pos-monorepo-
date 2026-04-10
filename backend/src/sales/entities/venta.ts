import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Client } from '../../clients/entities/client';
import { User } from '../../users/entities/user';
import { ItemVenta } from './itemVenta';
import { Factura } from '../../invoices/entities/factura';

export enum EstadoVenta {
  PENDIENTE = 'PENDIENTE',
  COMPLETADA = 'COMPLETADA',
  ANULADA = 'ANULADA',
}

@Entity('venta')
export class Venta {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  fecha!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  iva!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total!: number;

  @Column({
    type: 'enum',
    enum: EstadoVenta,
    default: EstadoVenta.PENDIENTE,
  })
  estado!: EstadoVenta;

  @Column({ name: 'cliente_id' })
  clienteId!: string;

  @Column({ name: 'usuario_id' })
  usuarioId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Client, (cliente) => cliente.ventas)
  @JoinColumn({ name: 'cliente_id' })
  cliente!: Client;

  @ManyToOne(() => User, (usuario) => usuario.ventas)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: User;

  @OneToMany(() => ItemVenta, (item) => item.venta)
  itemVentas!: ItemVenta[];

  @OneToOne(() => Factura, (factura) => factura.venta)
  factura!: Factura;
}

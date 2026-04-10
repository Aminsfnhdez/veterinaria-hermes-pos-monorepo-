import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Venta } from '../../sales/entities/venta';

@Entity('cliente')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  nombre!: string;

  @Column({ unique: true })
  identificacion!: string;

  @Column({ nullable: true })
  telefono?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ name: 'nombre_mascota', nullable: true })
  nombreMascota?: string;

  @Column({ name: 'tipo_mascota', nullable: true })
  tipoMascota?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Venta, (venta) => venta.cliente)
  ventas!: Venta[];
}

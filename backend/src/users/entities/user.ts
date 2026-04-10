import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Venta } from '../../sales/entities/venta';

export enum RolUsuario {
  ADMIN = 'ADMIN',
  VENDEDOR = 'VENDEDOR',
}

@Entity('usuario')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column()
  nombre!: string;

  @Column({ type: 'enum', enum: RolUsuario })
  rol!: RolUsuario;

  @Column({ default: true })
  activo!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Venta, (venta) => venta.usuario)
  ventas!: Venta[];
}

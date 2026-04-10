import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Product, CategoriaProducto } from './entities/product';

export interface CreateProductDto {
  nombre: string;
  descripcion?: string;
  categoria: CategoriaProducto;
  precio: number;
  stock?: number;
  stockMinimo?: number;
  lote?: string;
  fechaCaducidad?: Date;
}

export interface UpdateProductDto {
  nombre?: string;
  descripcion?: string;
  categoria?: CategoriaProducto;
  precio?: number;
  stock?: number;
  stockMinimo?: number;
  lote?: string;
  fechaCaducidad?: Date;
  activo?: boolean;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return product;
  }

  async findLowStock(): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .where('product.stock <= product.stockMinimo')
      .andWhere('product.activo = :activo', { activo: true })
      .orderBy('product.stock', 'ASC')
      .getMany();
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    product.activo = false;
    await this.productRepository.save(product);
  }

  async findExpiringSoon(days: number = 30): Promise<Product[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return this.productRepository
      .createQueryBuilder('product')
      .where('product.fechaCaducidad <= :futureDate', { futureDate })
      .andWhere('product.fechaCaducidad >= :today', { today: new Date() })
      .andWhere('product.activo = :activo', { activo: true })
      .getMany();
  }

  async findExpired(): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .where('product.fechaCaducidad < :today', { today: new Date() })
      .andWhere('product.activo = :activo', { activo: true })
      .getMany();
  }
}
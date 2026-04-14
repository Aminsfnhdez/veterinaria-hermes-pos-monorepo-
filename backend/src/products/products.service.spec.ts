import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ProductsService,
  CreateProductDto,
  UpdateProductDto,
} from './products.service';
import { Product, CategoriaProducto } from './entities/product';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockProductRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const testProduct: Product = {
    id: 'product-123',
    nombre: 'Producto Prueba',
    descripcion: 'Descripción del producto',
    categoria: CategoriaProducto.MEDICAMENTO,
    precio: 100,
    stock: 50,
    stockMinimo: 10,
    lote: 'LOTE001',
    fechaCaducidad: new Date(Date.now() + 86400000 * 60),
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    it('debería retornar productos activos ordenados por nombre', async () => {
      mockProductRepository.find.mockResolvedValue([testProduct]);

      const result = await service.findAll();

      expect(result).toEqual([testProduct]);
      expect(mockProductRepository.find).toHaveBeenCalledWith({
        where: { activo: true },
        order: { nombre: 'ASC' },
      });
    });

    it('debería retornar array vacío cuando no hay productos', async () => {
      mockProductRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne()', () => {
    it('debería retornar producto cuando existe', async () => {
      mockProductRepository.findOne.mockResolvedValue(testProduct);

      const result = await service.findOne('product-123');

      expect(result).toEqual(testProduct);
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'product-123' },
      });
    });

    it('debería lanzar NotFoundException cuando producto no existe', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        'Producto con ID nonexistent-id no encontrado',
      );
    });
  });

  describe('findLowStock()', () => {
    it('debería retornar productos con stock <= stockMinimo', async () => {
      const lowStockProduct = { ...testProduct, stock: 5 };
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([lowStockProduct]),
      };
      mockProductRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.findLowStock();

      expect(result).toEqual([lowStockProduct]);
      expect(mockProductRepository.createQueryBuilder).toHaveBeenCalledWith(
        'product',
      );
    });
  });

  describe('create()', () => {
    it('debería crear producto exitosamente', async () => {
      const createDto: CreateProductDto = {
        nombre: 'Nuevo Producto',
        categoria: CategoriaProducto.ALIMENTO,
        precio: 50,
        stock: 100,
        stockMinimo: 20,
      };

      mockProductRepository.create.mockReturnValue({
        ...testProduct,
        ...createDto,
      });
      mockProductRepository.save.mockResolvedValue({
        ...testProduct,
        ...createDto,
      });

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(mockProductRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockProductRepository.save).toHaveBeenCalled();
    });
  });

  describe('update()', () => {
    it('debería actualizar producto exitosamente', async () => {
      const updateDto: UpdateProductDto = {
        nombre: 'Producto Actualizado',
        precio: 150,
      };

      mockProductRepository.findOne.mockResolvedValue(testProduct);
      mockProductRepository.save.mockResolvedValue({
        ...testProduct,
        ...updateDto,
      });

      const result = await service.update('product-123', updateDto);

      expect(result).toBeDefined();
      expect(mockProductRepository.save).toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException cuando producto a actualizar no existe', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent-id', { nombre: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove()', () => {
    it('debería hacer soft delete (activo=false)', async () => {
      mockProductRepository.findOne.mockResolvedValue(testProduct);
      mockProductRepository.save.mockResolvedValue({
        ...testProduct,
        activo: false,
      });

      await service.remove('product-123');

      expect(mockProductRepository.save).toHaveBeenCalledWith({
        ...testProduct,
        activo: false,
      });
    });

    it('debería lanzar NotFoundException cuando producto a eliminar no existe', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findExpiringSoon()', () => {
    it('debería retornar productos próximos a vencer en 30 días', async () => {
      const expiringProduct = {
        ...testProduct,
        fechaCaducidad: new Date(Date.now() + 86400000 * 15),
      };
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([expiringProduct]),
      };
      mockProductRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.findExpiringSoon(30);

      expect(result).toEqual([expiringProduct]);
    });

    it('debería usar valor por defecto de 30 días', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      mockProductRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      await service.findExpiringSoon();

      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });
  });

  describe('findExpired()', () => {
    it('debería retornar productos vencidos', async () => {
      const expiredProduct = {
        ...testProduct,
        fechaCaducidad: new Date(Date.now() - 86400000 * 5),
      };
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([expiredProduct]),
      };
      mockProductRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.findExpired();

      expect(result).toEqual([expiredProduct]);
    });
  });
});

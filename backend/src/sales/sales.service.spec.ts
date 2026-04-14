import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SalesService, CreateSaleDto, CreateSaleItemDto } from './sales.service';
import { Venta, ItemVenta, EstadoVenta } from './entities';
import { Product, CategoriaProducto } from '../products/entities/product';
import { Client } from '../clients/entities/client';
import { User, RolUsuario } from '../users/entities/user';

describe('SalesService', () => {
  let service: SalesService;

  const mockVentaRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockItemVentaRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockProductRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(),
  };

  const testClient: Client = {
    id: 'client-123',
    nombre: 'Cliente Prueba',
    identificacion: '12345678',
    telefono: '3001234567',
    email: 'cliente@test.com',
    nombreMascota: 'Mascota Prueba',
    tipoMascota: 'Perro',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const testUser: User = {
    id: 'user-123',
    email: 'admin@hermes.com',
    passwordHash: 'hash',
    nombre: 'Admin',
    rol: RolUsuario.ADMIN,
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ventas: [],
  };

  const testProduct: Product = {
    id: 'product-123',
    nombre: 'Producto Prueba',
    descripcion: 'Descripción',
    categoria: CategoriaProducto.MEDICAMENTO,
    precio: 100,
    stock: 50,
    stockMinimo: 10,
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const testVenta: Venta = {
    id: 'venta-123',
    fecha: new Date(),
    subtotal: 100,
    iva: 19,
    total: 119,
    estado: EstadoVenta.COMPLETADA,
    clienteId: 'client-123',
    usuarioId: 'user-123',
    cliente: testClient,
    usuario: testUser,
    itemVentas: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        { provide: getRepositoryToken(Venta), useValue: mockVentaRepository },
        { provide: getRepositoryToken(ItemVenta), useValue: mockItemVentaRepository },
        { provide: getRepositoryToken(Product), useValue: mockProductRepository },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
    jest.clearAllMocks();
    mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSale()', () => {
    const createSaleDto: CreateSaleDto = {
      clienteId: 'client-123',
      usuarioId: 'user-123',
      items: [{ productoId: 'product-123', cantidad: 2 }],
    };

    it('debería crear venta exitosa con IVA 19% y actualizar stock', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue({
        ...testProduct,
        stock: 50,
        fechaCaducidad: new Date(Date.now() + 86400000 * 60),
      });
      mockQueryRunner.manager.create.mockReturnValue(testVenta);
      mockQueryRunner.manager.save.mockImplementation((entity) => Promise.resolve({ ...entity, id: 'venta-123' }));
      mockVentaRepository.findOne.mockResolvedValue({
        ...testVenta,
        itemVentas: [{ cantidad: 2, precioUnitario: 100, subtotal: 200, ivaItem: 38 }],
      });

      const result = await service.createSale(createSaleDto);

      expect(result).toBeDefined();
      expect(result.id).toBe('venta-123');
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.update).toHaveBeenCalledWith(
        Product,
        { id: 'product-123' },
        { stock: 48 },
      );
    });

    it('debería lanzar ConflictException cuando el carrito está vacío', async () => {
      const emptyDto: CreateSaleDto = {
        clienteId: 'client-123',
        usuarioId: 'user-123',
        items: [],
      };

      await expect(service.createSale(emptyDto)).rejects.toThrow(ConflictException);
      await expect(service.createSale(emptyDto)).rejects.toThrow(
        'La venta debe tener al menos un producto',
      );
    });

    it('debería lanzar NotFoundException cuando producto no existe', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue(null);

      await expect(service.createSale(createSaleDto)).rejects.toThrow(NotFoundException);
      await expect(service.createSale(createSaleDto)).rejects.toThrow(
        'Producto con ID product-123 no encontrado',
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('debería lanzar ConflictException cuando producto está inactivo', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue({
        ...testProduct,
        activo: false,
      });

      await expect(service.createSale(createSaleDto)).rejects.toThrow(ConflictException);
      await expect(service.createSale(createSaleDto)).rejects.toThrow(
        'El producto "Producto Prueba" ya no está activo',
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('debería lanzar ConflictException cuando producto está vencido', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue({
        ...testProduct,
        activo: true,
        fechaCaducidad: new Date(Date.now() - 86400000),
      });

      await expect(service.createSale(createSaleDto)).rejects.toThrow(ConflictException);
      await expect(service.createSale(createSaleDto)).rejects.toThrow(
        'El producto "Producto Prueba" está vencido y no puede ser vendido',
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('debería lanzar ConflictException cuando stock insuficiente', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue({
        ...testProduct,
        stock: 1,
        activo: true,
        fechaCaducidad: new Date(Date.now() + 86400000 * 60),
      });

      await expect(service.createSale(createSaleDto)).rejects.toThrow(ConflictException);
      await expect(service.createSale(createSaleDto)).rejects.toThrow(
        'Stock insuficiente para "Producto Prueba". Disponible: 1, solicitado: 2',
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('findAll()', () => {
    it('debería retornar lista de ventas', async () => {
      mockVentaRepository.find.mockResolvedValue([testVenta]);

      const result = await service.findAll();

      expect(result).toEqual([testVenta]);
      expect(mockVentaRepository.find).toHaveBeenCalledWith({
        relations: ['itemVentas', 'cliente', 'usuario'],
        order: { fecha: 'DESC' },
      });
    });
  });

  describe('findOne()', () => {
    it('debería retornar venta cuando existe', async () => {
      mockVentaRepository.findOne.mockResolvedValue(testVenta);

      const result = await service.findOne('venta-123');

      expect(result).toEqual(testVenta);
      expect(mockVentaRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'venta-123' },
        relations: ['itemVentas', 'cliente', 'usuario'],
      });
    });

    it('debería lanzar NotFoundException cuando venta no existe', async () => {
      mockVentaRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        'Venta con ID nonexistent-id no encontrada',
      );
    });
  });

  describe('cancel()', () => {
    it('debería cancelar venta exitosamente', async () => {
      mockVentaRepository.findOne.mockResolvedValue({ ...testVenta, estado: EstadoVenta.COMPLETADA });
      mockVentaRepository.save.mockResolvedValue({ ...testVenta, estado: EstadoVenta.ANULADA });

      const result = await service.cancel('venta-123');

      expect(result.estado).toBe(EstadoVenta.ANULADA);
      expect(mockVentaRepository.save).toHaveBeenCalled();
    });

    it('debería lanzar ConflictException cuando venta ya está anulada', async () => {
      mockVentaRepository.findOne.mockResolvedValue({ ...testVenta, estado: EstadoVenta.ANULADA });

      await expect(service.cancel('venta-123')).rejects.toThrow(ConflictException);
      await expect(service.cancel('venta-123')).rejects.toThrow('La venta ya está anulada');
    });

    it('debería lanzar ConflictException cuando venta está pendiente', async () => {
      mockVentaRepository.findOne.mockResolvedValue({ ...testVenta, estado: EstadoVenta.PENDIENTE });

      await expect(service.cancel('venta-123')).rejects.toThrow(ConflictException);
      await expect(service.cancel('venta-123')).rejects.toThrow(
        'No se puede anular una venta pendiente',
      );
    });
  });
});
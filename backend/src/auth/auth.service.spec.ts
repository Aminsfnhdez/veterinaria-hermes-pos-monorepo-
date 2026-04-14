import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService, LoginDto, AuthResponse } from './auth.service';
import { User, RolUsuario } from '../users/entities/user';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const testUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'admin@hermes.com',
    passwordHash:
      '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqG3N.I/7F6',
    nombre: 'Admin User',
    rol: RolUsuario.ADMIN,
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ventas: [],
  };

  beforeEach(async () => {
    (bcrypt.compare as jest.Mock).mockReset();
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login()', () => {
    const loginDto: LoginDto = {
      email: 'admin@hermes.com',
      password: 'password123',
    };

    it('debería retornar JWT y user data cuando credenciales son válidas', async () => {
      mockUserRepository.findOne.mockResolvedValue(testUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');
      mockConfigService.get.mockReturnValue('8h');

      const result: AuthResponse = await service.login(loginDto);

      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user.id).toBe(testUser.id);
      expect(result.user.email).toBe(testUser.email);
      expect(result.user.nombre).toBe(testUser.nombre);
      expect(result.user.rol).toBe(testUser.rol);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
    });

    it('debería lanzar UnauthorizedException cuando usuario no existe', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Credenciales inválidas',
      );
    });

    it('debería lanzar UnauthorizedException cuando password es incorrecto', async () => {
      mockUserRepository.findOne.mockResolvedValue(testUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: loginDto.email, password: 'wrongpassword' }),
      ).rejects.toThrow('Credenciales inválidas');
    });

    it('debería lanzar UnauthorizedException cuando usuario está inactivo', async () => {
      const inactiveUser = { ...testUser, activo: false };
      mockUserRepository.findOne.mockResolvedValue(inactiveUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow('Usuario inactivo');
    });
  });

  describe('validateUser()', () => {
    it('debería retornar usuario cuando existe', async () => {
      mockUserRepository.findOne.mockResolvedValue(testUser);

      const result = await service.validateUser(testUser.id);

      expect(result).toEqual(testUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: testUser.id },
      });
    });

    it('debería retornar null cuando usuario no existe', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent-id');

      expect(result).toBeNull();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'nonexistent-id' },
      });
    });
  });
});

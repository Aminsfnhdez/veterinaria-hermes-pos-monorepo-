import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  const mockDataSource = {
    query: jest.fn().mockResolvedValue([]),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'NODE_ENV') return 'development';
      return null;
    }),
    getOrThrow: jest.fn().mockReturnValue('test-value'),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getHello()', () => {
    it('should return service info object', () => {
      const result = appController.getHello();
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('service', 'Veterinaria Hermes POS API');
      expect(result).toHaveProperty('version', '1.0.0');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('environment', 'development');
      expect(result).toHaveProperty('endpoints');
    });
  });

  describe('checkHealth()', () => {
    it('should return health status', async () => {
      const result = await appController.checkHealth();
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('memory');
    });
  });

  describe('checkDatabaseHealth()', () => {
    it('should return database health status', async () => {
      const result = await appController.checkDatabaseHealth();
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('database', 'postgresql');
      expect(result).toHaveProperty('response_time_ms');
      expect(result).toHaveProperty('timestamp');
    });
  });
});

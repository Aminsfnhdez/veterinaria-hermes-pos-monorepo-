import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  getHello(): object {
    return {
      status: 'ok',
      service: 'Veterinaria Hermes POS API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: this.configService.get('NODE_ENV') || 'development',
      endpoints: {
        documentation: '/api',
        health: '/health',
        health_db: '/health/db',
        auth: '/auth',
        products: '/products',
        sales: '/sales',
        invoices: '/invoices',
        clients: '/clients',
        users: '/users',
      },
    };
  }

  async checkHealth(): Promise<object> {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
      memory: {
        used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      },
    };
  }

  async checkDatabaseHealth(): Promise<object> {
    try {
      const start = Date.now();
      await this.dataSource.query('SELECT 1');
      const responseTime = Date.now() - start;

      return {
        status: 'ok',
        database: 'postgresql',
        response_time_ms: responseTime,
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'postgresql',
        message: 'Unable to connect to database',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

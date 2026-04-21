import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Endpoint raíz del backend',
    description:
      'Retorna información general del servicio, versión, entorno y lista de endpoints disponibles',
  })
  @ApiResponse({
    status: 200,
    description: 'Información general del servicio',
  })
  getHello() {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health check del backend',
    description:
      'Verifica que el backend está activo. Retorna uptime y uso de memoria.',
  })
  @ApiResponse({
    status: 200,
    description: 'Backend operativo',
  })
  checkHealth() {
    return this.appService.checkHealth();
  }

  @Get('health/db')
  @ApiOperation({
    summary: 'Health check de base de datos',
    description:
      'Verifica la conectividad a PostgreSQL. No expone credenciales.',
  })
  @ApiResponse({
    status: 200,
    description: 'Base de datos accesible',
  })
  @ApiResponse({
    status: 503,
    description: 'Base de datos no accesible',
  })
  async checkDatabaseHealth() {
    return this.appService.checkDatabaseHealth();
  }
}

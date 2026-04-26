import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const origin = process.env.FRONTEND_URL ?? 'http://localhost:4200';
  app.enableCors({ origin, credentials: true });

  const config = new DocumentBuilder()
    .setTitle('Veterinaria Hermes POS API')
    .setDescription(
      'API del sistema de punto de venta para Veterinaria Hermes. Incluye autenticación JWT, gestión de productos, ventas, clientes, facturas y control de inventario.\n\n' +
        '## Autenticación\n' +
        '1. Ejecutar POST /auth/login con credenciales\n' +
        '2. Copiar el token JWT de la respuesta\n' +
        '3. Hacer clic en "Authorize" y pegar el token\n' +
        '4. Todos los endpoints protegidos aceptarán el token automáticamente\n\n' +
        '## Health Checks\n' +
        '- GET / - Información general del servicio\n' +
        '- GET /health - Estado del backend (uptime, memoria)\n' +
        '- GET /health/db - Verificación de conexión a PostgreSQL',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingrese el token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('health', 'Health checks del sistema')
    .addTag('auth', 'Autenticación y login')
    .addTag('products', 'Gestión de productos (inventario)')
    .addTag('clients', 'Gestión de clientes')
    .addTag('sales', 'Gestión de ventas')
    .addTag('invoices', 'Facturación y PDFs')
    .addTag('users', 'Gestión de usuarios (solo ADMIN)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

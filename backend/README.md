# Hermes POS Backend

> Sistema de punto de venta para Veterinaria Hermes - Backend NestJS

## Stack Tecnológico

| Tecnología | Versión |
|------------|---------|
| NestJS | 11.0.16 |
| TypeORM | Latest |
| PostgreSQL | Latest (Clever Cloud) |
| JWT | @nestjs/jwt |
| bcrypt | rounds = 12 |
| PDFKit | Latest |
| Swagger | @nestjs/swagger |

## Instalación

```bash
# Instalar dependencias
npm install

# Copiar archivo de variables de entorno
cp .env.example .env
```

### Variables de Entorno (.env)

```env
# Base de datos (Clever Cloud)
DATABASE_URL=postgresql://usuario:password@host:puerto/nombre_bd

# JWT
JWT_SECRET=tu_secret_aqui
JWT_EXPIRATION=8h

# Servidor
PORT=3000
FRONTEND_URL=http://localhost:4200

# Seguridad
BCRYPT_ROUNDS=12

# Empresa
COMPANY_NIT=900000000-0
```

## Desarrollo

```bash
# Servidor de desarrollo (watch mode)
npm run start:dev

# Compilar TypeScript
npm run build

# Servidor de producción
npm run start:prod

# URL del servidor
http://localhost:3000
```

## Tests

```bash
# Tests unitarios
npm test

# Coverage
npm run test:cov

# Tests e2e (requiere configuración de BD adicional)
npm run test:e2e
```

**51 unit tests** — Cobertura >80% en servicios críticos (Auth, Sales, Products).

## API Endpoints

### Autenticación

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| POST | /auth/login | Iniciar sesión | Público |

### Productos

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| GET | /products | Listar todos | ADMIN, VENDEDOR |
| GET | /products/:id | Obtener por ID | ADMIN, VENDEDOR |
| POST | /products | Crear producto | ADMIN |
| PATCH | /products/:id | Actualizar | ADMIN |
| DELETE | /products/:id | Eliminar | ADMIN |
| GET | /products/low-stock | Stock bajo | ADMIN |
| GET | /products/expiring-soon | Próximos a vencer | ADMIN |
| GET | /products/expired | Vencidos | ADMIN |

### Clientes

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| GET | /clients | Listar todos | ADMIN, VENDEDOR |
| GET | /clients/:id | Obtener por ID | ADMIN, VENDEDOR |
| POST | /clients | Crear cliente | ADMIN, VENDEDOR |
| PATCH | /clients/:id | Actualizar | ADMIN, VENDEDOR |
| DELETE | /clients/:id | Eliminar | ADMIN |

### Ventas

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| GET | /sales | Listar todas | ADMIN, VENDEDOR |
| GET | /sales/:id | Obtener por ID | ADMIN, VENDEDOR |
| POST | /sales | Crear venta | ADMIN, VENDEDOR |
| PATCH | /sales/:id/cancel | Cancelar venta | ADMIN |

### Facturas

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| GET | /invoices | Listar todas | ADMIN, VENDEDOR |
| GET | /invoices/:id | Obtener por ID | ADMIN, VENDEDOR |
| POST | /invoices | Crear factura | ADMIN, VENDEDOR |
| GET | /invoices/:id/pdf | Descargar PDF | ADMIN, VENDEDOR |
| GET | /invoices/by-venta/:ventaId | Por ID de venta | ADMIN, VENDEDOR |

### Usuarios

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| GET | /users | Listar todos | ADMIN |
| GET | /users/:id | Obtener por ID | ADMIN |
| POST | /users | Crear usuario | ADMIN |
| PATCH | /users/:id | Actualizar | ADMIN |
| DELETE | /users/:id | Eliminar | ADMIN |

## Swagger

Documentación interactiva disponible en:

```
http://localhost:3000/api
```

Incluye:
- Todos los endpoints documentados
- Schemas de DTOs
- Autenticación JWT (Authorize button)
- Respuestas de ejemplo

## Despliegue Vercel

### 1. Conectar repositorio

1. Ir a [Vercel](https://vercel.com)
2. Importar repositorio GitHub
3. Seleccionar carpeta `backend`

### 2. Configurar Variables

En Vercel Dashboard → Settings → Environment Variables:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=valor_seguro
JWT_EXPIRATION=8h
FRONTEND_URL=https://hermes-pos.vercel.app
BCRYPT_ROUNDS=12
COMPANY_NIT=900000000-0
```

### 3. Despliegue

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/main.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/main.js"
    }
  ]
}
```

**Nota:** Tiempo máximo de ejecución en Vercel: 10 segundos.

## Base de Datos

### Clever Cloud

1. Crear addon PostgreSQL en Clever Cloud
2. Obtener connection string (DATABASE_URL)
3. Ejecutar schema.sql:

```bash
psql $DATABASE_URL -f schema.sql
psql $DATABASE_URL -f seed.sql
```

### Schema

- ENUMs: categoriaproducto, estadoventa, rolusuario, metodopago
- Tablas: producto, cliente, usuario, venta, itemventa, factura
- Restricciones: stock >= 0 (CHECK), identificacion UNIQUE, email UNIQUE

## Reglas de Negocio

### Stock
- Nunca permitir stock negativo
- SELECT FOR UPDATE en transacciones concurrentes
- CHECK constraint en PostgreSQL

### Productos
- MEDICAMENTO: lote y fechaCaducidad obligatorios
- ALIMENTO: fechaCaducidad obligatoria, lote opcional
- ACCESORIO: sin lote ni fechaCaducidad
- Bloquear venta si fechaCaducidad < hoy

### IVA
- 19% en todos los productos
- Calculado automáticamente en ventas

### Facturación
- Número de factura vía SEQUENCE PostgreSQL (atómico)
- CUFE: SHA-256 simulado
- PDF generado en memoria (buffer)

## Licencia

MIT
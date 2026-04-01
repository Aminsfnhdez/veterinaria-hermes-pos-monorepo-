# agent.md — Sistema POS Veterinaria Hermes

> **Uso:** Este archivo es el contexto principal del agente de desarrollo.
> Cárgalo en Claude Code, Cursor (`.cursor/rules/agent.md`) o antigravity antes de iniciar cualquier sesión de trabajo.
> No contiene credenciales ni connection strings reales.

---

## 1. IDENTIDAD Y ROL

Eres un arquitecto de software senior especializado en sistemas empresariales para el sector veterinario. Tu responsabilidad es diseñar e implementar el sistema POS completo para **Veterinaria Hermes** siguiendo estrictamente las reglas de este archivo.

**Nunca tomes decisiones que contradigan una regla definida aquí.**
Si encuentras un conflicto o ambigüedad, detente y pregunta antes de continuar.

---

## 2. CONTEXTO DEL NEGOCIO

| Campo | Valor |
|---|---|
| Negocio | Clínica y tienda veterinaria Hermes |
| País | Colombia |
| IVA | 19 % por defecto en todos los productos |
| Facturación | Electrónica compatible con DIAN (simulada en esta versión) |
| CUFE | SHA-256 simulado — integración real con DIAN fuera de alcance v1 |
| NIT establecimiento | Configurable via variable de entorno `COMPANY_NIT` |
| Base de datos | PostgreSQL gestionado en **Clever Cloud** (solo acceso via connection string) |
| Despliegue | **Vercel** para frontend y backend |

### Productos veterinarios

| Categoría | Lote | Fecha caducidad |
|---|---|---|
| Medicamento | **Obligatorio** | **Obligatoria** |
| Alimento | Opcional | **Obligatoria** |
| Accesorio | No aplica | No aplica |

**Reglas de productos próximos a vencer:**
- Advertir (sin bloquear) si `fechaCaducidad <= hoy + 30 días`
- **Bloquear venta** si `fechaCaducidad < hoy`

### 2.1. Etapa 1 — Modelado del dominio (consolidado)

Resultado validado de la Etapa 1. Tipos enumerados PostgreSQL: `categoria_producto`, `estado_venta`, `rol_usuario`, `metodo_pago` (definidos en la sección 8.2 de este mismo archivo).

#### Diagrama ERD (Mermaid)

```mermaid
erDiagram
    Producto {
        uuid id PK
        varchar nombre
        text descripcion
        categoria_producto categoria
        numeric precio
        int stock
        int stockMinimo
        varchar lote_nullable
        date fechaCaducidad_nullable
        boolean activo
        timestamptz createdAt
        timestamptz updatedAt
    }

    Cliente {
        uuid id PK
        varchar nombre
        varchar identificacion UK
        varchar telefono_ambiguo
        varchar email_ambiguo
        varchar nombreMascota_nullable
        varchar tipoMascota_nullable
        timestamptz createdAt
        timestamptz updatedAt
    }

    Usuario {
        uuid id PK
        varchar email UK
        varchar passwordHash
        varchar nombre
        rol_usuario rol
        boolean activo
        timestamptz createdAt
        timestamptz updatedAt
    }

    Venta {
        uuid id PK
        timestamptz fecha
        numeric subtotal
        numeric iva
        numeric total
        estado_venta estado
        uuid clienteId FK
        uuid usuarioId FK
        timestamptz createdAt
        timestamptz updatedAt
    }

    ItemVenta {
        uuid id PK
        int cantidad
        numeric precioUnitario
        numeric subtotal
        numeric ivaItem
        uuid productoId FK
        uuid ventaId FK
    }

    Factura {
        uuid id PK
        varchar numeroFactura UK
        timestamptz fechaEmision
        metodo_pago metodoPago
        varchar cufe_nullable
        uuid ventaId FK_UK
    }

    Cliente ||--o{ Venta : tiene
    Usuario ||--o{ Venta : registra
    Venta ||--|{ ItemVenta : contiene
    Producto ||--o{ ItemVenta : aparece_en
    Venta ||--|| Factura : genera
```

#### Matriz de entidades (atributos, tipos PostgreSQL, observaciones)

| Entidad | Atributos y observaciones |
|---|---|
| **Producto** | `id UUID PK`, `nombre VARCHAR`, `descripcion TEXT`, `categoria categoria_producto`, `precio NUMERIC(10,2)`, `stock INT`, `stockMinimo INT`, `lote VARCHAR NULL`, `fechaCaducidad DATE NULL`, `activo BOOLEAN`, `createdAt TIMESTAMPTZ`, `updatedAt TIMESTAMPTZ`. Restricción: `stock >= 0` (CHECK). Lote y caducidad según categoría según tabla de productos veterinarios en esta sección. |
| **Cliente** | `id UUID PK`, `nombre VARCHAR`, `identificacion VARCHAR UNIQUE`, `telefono VARCHAR` (**ambigüedad abierta:** obligatorio `NOT NULL` vs opcional `NULL` — no fijado en este documento), `email VARCHAR` (**misma ambigüedad**), `nombreMascota VARCHAR NULL`, `tipoMascota VARCHAR NULL`, `createdAt TIMESTAMPTZ`, `updatedAt TIMESTAMPTZ`. |
| **Usuario** | `id UUID PK`, `email VARCHAR UNIQUE`, `passwordHash VARCHAR`, `nombre VARCHAR`, `rol rol_usuario`, `activo BOOLEAN`, `createdAt TIMESTAMPTZ`, `updatedAt TIMESTAMPTZ`. |
| **Venta** | `id UUID PK`, `fecha TIMESTAMPTZ`, `subtotal NUMERIC(10,2)`, `iva NUMERIC(10,2)`, `total NUMERIC(10,2)`, `estado estado_venta`, `clienteId UUID FK`, `usuarioId UUID FK`, `createdAt TIMESTAMPTZ`, `updatedAt TIMESTAMPTZ`. |
| **ItemVenta** | `id UUID PK`, `cantidad INT`, `precioUnitario NUMERIC(10,2)`, `subtotal NUMERIC(10,2)`, `ivaItem NUMERIC(10,2)`, `productoId UUID FK`, `ventaId UUID FK`. Regla: `ivaItem = subtotal × 0,19`. |
| **Factura** | `id UUID PK`, `numeroFactura VARCHAR UNIQUE`, `fechaEmision TIMESTAMPTZ`, `metodoPago metodo_pago`, `cufe VARCHAR NULL`, `ventaId UUID FK UNIQUE` (relación 1:1 con venta). `numeroFactura` inmutable; numeración atómica vía `SEQUENCE` en PostgreSQL. |

#### Relaciones y cardinalidades

- Cliente **1 — N** Venta
- Usuario **1 — N** Venta
- Venta **1 — N** ItemVenta
- Producto **1 — N** ItemVenta
- Venta **1 — 1** Factura

#### Decisiones consolidadas (breve)

- **Factura ↔ Venta:** modelo 1:1 según especificación (`ventaId` único en factura).
- **Producto:** obligatoriedad de `lote` y `fechaCaducidad` por categoría sigue las tablas de negocio de esta sección; la columna puede ser `NULL` cuando la categoría no aplica, salvo que en Etapa 2 se acuerde refuerzo en BD.
- **IVA:** 19 % por defecto en productos; montos en cabecera (`Venta`) e ítem (`ItemVenta`) según reglas de negocio documentadas más adelante en este archivo.

#### Ambigüedades y preguntas abiertas (no asumir por defecto)

- **`Cliente.telefono` y `Cliente.email`:** pendiente decidir si son `NOT NULL` o permiten `NULL`.
- **Lote y fecha de caducidad por categoría:** pendiente decidir si además de validación en servicio se fuerzan con `CHECK` en PostgreSQL o solo en capa de aplicación.

### 2.2. Etapa 2 — Esquema PostgreSQL Clever Cloud (consolidado aprobado)

#### Archivos generados (raíz del repositorio)

| Archivo | Propósito |
|---|---|
| `schema.sql` | DDL ejecutable en PostgreSQL (Clever Cloud): tipos, tablas, restricciones, secuencia, índices, FKs. |
| `seed.sql` | Datos de prueba: **10** productos, **3** clientes, **2** usuarios (contraseña de seed documentada en el propio script). |
| `.env.example` | Plantilla de variables de entorno alineada al backend y al despliegue (JWT, CORS, Clever Cloud, facturación). |

#### ENUMs adoptados en el esquema SQL

Los tipos PostgreSQL usados en `schema.sql` son exactamente:

- `categoriaproducto`
- `estadoventa`
- `rolusuario`
- `metodopago`

#### Restricciones y elementos clave del esquema

- **UUID:** claves primarias con `DEFAULT gen_random_uuid()` (extensión `pgcrypto`).
- **Secuencia:** `facturaseq` para numeración atómica de facturas (prefijo/forma `FE-YYYY-NNNNNN` en capa de aplicación).
- **UNIQUE:** `factura.numero_factura`, `usuario.email`, `cliente.identificacion`.
- **CHECK:** `producto.stock >= 0`.
- **Timestamps:** `created_at` y `updated_at` (`TIMESTAMPTZ`) en todas las tablas del esquema.
- **FKs:** relaciones según el modelo (cliente/usuario → venta; venta → ítems y factura 1:1; producto → ítem).
- **Índices:** `producto(nombre)`, `venta(fecha)`; `cliente(identificacion)` cubierto por el índice único de la restricción `UNIQUE`.

#### Decisión de consistencia de nombres (ENUMs y columnas)

- **ENUMs en PostgreSQL:** se mantiene de forma estable la convención **sin guiones bajos** en el nombre del tipo (`categoriaproducto`, `estadoventa`, `rolusuario`, `metodopago`) en todo el ciclo del proyecto; no renombrar a variantes con guion bajo a mitad de desarrollo para evitar roturas entre `schema.sql`, ORM y despliegues.
- **Columnas SQL:** el DDL usa **snake_case** (`password_hash`, `cliente_id`, `created_at`, …), coherente con PostgreSQL y con mapeo explícito futuro en entidades TypeORM (`@Column({ name: '...' })`).

> **Nota:** En diagramas y tablas narrativas anteriores de este documento pueden aparecer guiones bajos en la etiqueta del tipo (p. ej. `categoria_producto`); la fuente de verdad operativa para el motor es el nombre definido en `schema.sql`.

---

## 3. STACK TÉCNICO — VERSIONES INAMOVIBLES

```
Frontend:        Angular 21.0.2
Estilos:         Tailwind CSS 4.0 + Flowbite
Backend:         NestJS 11.0.16
ORM:             TypeORM (incluido en NestJS)
Base de datos:   PostgreSQL (Clever Cloud)
Despliegue:      Vercel (frontend y backend)
```

### Alternativas PROHIBIDAS

| Capa | Prohibido |
|---|---|
| Frontend | React, Vue, Svelte, cualquier otro framework |
| Estilos | Bootstrap, Material UI, Daisy UI, Chakra UI |
| Backend | Express, Fastify, Hono, cualquier otro framework |
| ORM | Prisma, Drizzle, Sequelize |
| Base de datos | MySQL, MongoDB, SQLite, Supabase |
| Despliegue | Docker, Podman, Railway, Render, Heroku, cualquier container |
| Contenerización | **Docker está completamente prohibido en este proyecto** |

---

## 4. MODO DE TRABAJO

### 4.1 Flujo de aprobación por etapas

> **REGLA CRÍTICA:** Nunca avances a la siguiente etapa sin recibir aprobación explícita del usuario.

Al finalizar cada etapa debes entregar:

1. Resumen de lo completado
2. Lista de entregables concretos (código, scripts, diagramas)
3. Decisiones tomadas y sus justificaciones
4. Preguntas de clarificación pendientes (si las hay)
5. La pregunta: **"¿Apruebas esta etapa y deseas continuar con la siguiente?"**

### 4.2 Manejo de ambigüedades

Antes de iniciar cualquier etapa, si detectas ambigüedades críticas **detente y pregunta**. Nunca asumas valores por defecto en:

- Tasa de IVA para categorías específicas (ej. medicamentos exentos)
- Métodos de pago habilitados en el negocio
- Si se requiere integración real con la API DIAN o solo simulación
- Cualquier regla de negocio no documentada aquí

---

## 5. REGLAS DE GENERACIÓN DE CÓDIGO

> **OBLIGATORIO:** Todo componente, servicio, guard, interceptor, módulo o recurso
> debe generarse usando los comandos CLI oficiales de Angular o NestJS.
> **Nunca crear archivos de código manualmente.**

### 5.1 Angular CLI — comandos obligatorios

```bash
# Módulos
ng generate module <nombre> --routing

# Componentes
ng generate component <nombre> --module=<modulo>

# Servicios
ng generate service services/<nombre>

# Guards
ng generate guard guards/<nombre>

# Interceptores
ng generate interceptor interceptors/<nombre>

# Pipes
ng generate pipe pipes/<nombre>

# Interfaces / modelos
ng generate interface models/<nombre>
```

### 5.2 NestJS CLI — comandos obligatorios

```bash
# Módulos
nest generate module <nombre>

# Controladores
nest generate controller <modulo>/<nombre>-controller

# Servicios
nest generate service <modulo>/<nombre>-service

# Guards
nest generate guard common/guards/<nombre>-guard

# Interceptores
nest generate interceptor common/interceptors/<nombre>-interceptor

# DTOs (sin archivo spec)
nest generate class <modulo>/dto/<nombre>-dto --no-spec

# Entidades TypeORM (sin archivo spec)
nest generate class <modulo>/entities/<nombre>-entity --no-spec
```

---

## 6. CONTROL DE VERSIONES — REGLAS DE GIT

### 6.1 Principio de commits granulares

> **Cada commit representa una unidad lógica mínima de trabajo.**
> Prohibido hacer commits grandes que mezclen múltiples funcionalidades o capas.

**Límites por commit:**

| Regla | Límite |
|---|---|
| Archivos modificados | Máximo 5 archivos |
| Líneas cambiadas | Máximo ~150 líneas |
| Responsabilidad | Un commit = una sola responsabilidad |
| Mezcla de capas | **Prohibido** mezclar BD + servicio + controller + frontend en un commit |

### 6.2 Formato: Conventional Commits (en español)

```
<tipo>(<alcance>): <descripción corta en español>
```

**Tipos permitidos:**

| Tipo | Cuándo usarlo |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de error |
| `refactor` | Refactorización sin cambio de comportamiento |
| `test` | Adición o corrección de pruebas |
| `docs` | Cambios en documentación |
| `chore` | Tareas de configuración o mantenimiento |
| `style` | Cambios de formato o estilos (no lógica) |

### 6.3 Ejemplos de commits CORRECTOS

```bash
feat(auth): agregar endpoint POST /auth/login con JWT
feat(products): crear entidad Product con TypeORM
feat(products): agregar servicio ProductsService con CRUD
feat(sales): implementar lógica de descuento de stock en SalesService
feat(invoices): generar número de factura secuencial con SEQUENCE
feat(frontend/pos): agregar componente SalePointComponent
feat(frontend/pos): implementar carrito de compras dinámico
feat(frontend/inventory): agregar alertas visuales de stock bajo
fix(inventory): corregir consulta de productos con stock bajo
fix(sales): aplicar ROLLBACK cuando stock insuficiente en transacción
test(sales): agregar pruebas unitarias para SalesService.createSale()
test(auth): agregar pruebas para login con credenciales inválidas
chore(config): configurar variables de entorno para Vercel
chore(db): agregar schema.sql con tablas y ENUMs
docs(api): documentar endpoint POST /invoices/generate en Swagger
style(frontend): aplicar clases Flowbite a tabla de inventario
```

### 6.4 Ejemplos de commits PROHIBIDOS

```bash
# PROHIBIDO — demasiado amplio
feat: implementar todo el módulo de ventas

# PROHIBIDO — mezcla capas
feat: agregar ventas al backend y al carrito del frontend

# PROHIBIDO — sin descripción útil
fix: correcciones
update: cambios varios
wip: avance

# PROHIBIDO — tipo inválido
update(products): actualizar producto
change(auth): cambiar auth
```

---

## 7. ARQUITECTURA DEL PROYECTO

### 7.1 Estructura backend (NestJS)

```
hermes-pos-backend/
├── src/
│   ├── auth/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── products/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   └── products.module.ts
│   ├── sales/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── sales.controller.ts
│   │   ├── sales.service.ts
│   │   └── sales.module.ts
│   ├── invoices/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── invoices.controller.ts
│   │   ├── invoices.service.ts
│   │   └── invoices.module.ts
│   ├── clients/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── clients.controller.ts
│   │   ├── clients.service.ts
│   │   └── clients.module.ts
│   ├── users/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── common/
│   │   ├── decorators/
│   │   │   └── roles.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── interceptors/
│   │   │   └── response-format.interceptor.ts
│   │   └── filters/
│   │       └── http-exception.filter.ts
│   ├── app.module.ts
│   └── main.ts
├── schema.sql
├── seed.sql
├── vercel.json
├── .env.example
└── README.md
```

### 7.2 Estructura frontend (Angular)

```
hermes-pos-frontend/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   └── login/
│   │   │   ├── guards/
│   │   │   ├── services/
│   │   │   └── auth.module.ts
│   │   ├── pos/
│   │   │   ├── components/
│   │   │   │   ├── sale-point/
│   │   │   │   └── cart/
│   │   │   ├── services/
│   │   │   └── pos.module.ts
│   │   ├── inventory/
│   │   │   ├── components/
│   │   │   │   ├── inventory-list/
│   │   │   │   └── alerts-dashboard/
│   │   │   ├── services/
│   │   │   └── inventory.module.ts
│   │   ├── invoices/
│   │   │   ├── components/
│   │   │   │   └── invoice-view/
│   │   │   ├── services/
│   │   │   └── invoices.module.ts
│   │   ├── shared/
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts
│   │   │   ├── services/
│   │   │   └── shared.module.ts
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── styles.css         ← @import 'tailwindcss' aquí (Tailwind v4 CSS-first)
│   └── main.ts
├── vercel.json
└── README.md
```

### 7.3 Raíz del repositorio

```
/
├── backend/
├── frontend/
├── agent.md              ← este archivo
├── CHANGELOG.md
└── README.md
```

---

## 8. MODELO DE DATOS

### 8.1 Entidades

| Entidad | Atributos clave | Observación |
|---|---|---|
| **Producto** | id (UUID), nombre, descripcion, categoria (enum), precio (NUMERIC 10,2), stock (INT), stockMinimo (INT), lote?, fechaCaducidad?, activo (BOOL), createdAt, updatedAt | lote y fechaCaducidad según categoría |
| **Cliente** | id (UUID), nombre, identificacion (NIT/CC, UNIQUE), telefono, email, nombreMascota?, tipoMascota?, createdAt, updatedAt | NIT para empresas, CC para personas |
| **Venta** | id (UUID), fecha (TIMESTAMPTZ), subtotal, iva, total, estado (enum), clienteId, usuarioId, createdAt, updatedAt | Anulada solo la asigna ADMIN |
| **ItemVenta** | id (UUID), cantidad, precioUnitario, subtotal, ivaItem, productoId, ventaId | ivaItem = subtotal × 0.19 |
| **Factura** | id (UUID), numeroFactura (FE-YYYY-NNNNNN, UNIQUE), fechaEmision, metodoPago (enum), cufe?, ventaId (1:1) | cufe = SHA-256 simulado |
| **Usuario** | id (UUID), email (UNIQUE), passwordHash, nombre, rol (enum), activo (BOOL), createdAt, updatedAt | bcrypt rounds = 12 |

### 8.2 ENUMs PostgreSQL

```sql
CREATE TYPE categoria_producto AS ENUM ('MEDICAMENTO', 'ALIMENTO', 'ACCESORIO');
CREATE TYPE estado_venta       AS ENUM ('PENDIENTE', 'COMPLETADA', 'ANULADA');
CREATE TYPE rol_usuario        AS ENUM ('ADMIN', 'VENDEDOR');
CREATE TYPE metodo_pago        AS ENUM ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA');
```

### 8.3 Restricciones críticas de BD

```sql
-- Stock nunca negativo
ALTER TABLE producto ADD CONSTRAINT chk_stock_positivo CHECK (stock >= 0);

-- Número de factura secuencial atómico
CREATE SEQUENCE factura_seq START 1;

-- UUIDs como clave primaria
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

---

## 9. REGLAS DE NEGOCIO CRÍTICAS

### 9.1 Integridad de stock

```
NUNCA permitir stock negativo.
Implementar en dos niveles:
  1. CHECK constraint en PostgreSQL (stock >= 0)
  2. Validación en SalesService antes de la transacción
```

### 9.2 Lógica de SalesService.createSale()

```
1. Recibir array [{ productoId, cantidad }]
2. Abrir transacción (BEGIN)
3. Para cada producto:
   a. SELECT ... FOR UPDATE (evitar condición de carrera)
   b. Si stock < cantidad → ROLLBACK + ConflictException
      Mensaje: "Stock insuficiente para [nombre del producto]"
4. Calcular subtotal, IVA (19 %), total
5. INSERT en Venta e ItemVenta
6. UPDATE stock de cada producto
7. COMMIT
8. Retornar venta con su ID

En cualquier error → ROLLBACK completo + excepción descriptiva
```

### 9.3 Matriz de permisos (RBAC)

| Recurso / Acción | ADMIN | VENDEDOR |
|---|---|---|
| Productos — leer | ✓ | ✓ |
| Productos — crear / editar / eliminar | ✓ | ✗ |
| Ajuste manual de stock | ✓ | ✗ |
| Clientes — leer | ✓ | ✓ |
| Clientes — crear / editar | ✓ | ✓ |
| Ventas — crear | ✓ | ✓ |
| Ventas — anular | ✓ | ✗ |
| Facturas — generar | ✓ | ✓ |
| Usuarios — gestionar | ✓ | ✗ |
| Reportes y alertas de inventario | ✓ | ✗ |

### 9.4 Reglas adicionales

- Una **factura cancelada no restaura stock** automáticamente; solo ADMIN puede hacer ajustes manuales.
- El **número de factura es inmutable** una vez generado.
- Un **usuario inactivo** (`activo = false`) no puede iniciar sesión aunque sus credenciales sean válidas.
- La **generación de PDF** debe hacerse en memoria (buffer), nunca escribir en disco (restricción Vercel serverless).
- El **tiempo máximo de ejecución** en Vercel es 10 segundos por función.

---

## 10. VARIABLES DE ENTORNO

### Backend (`.env.example`)

```env
# Base de datos — Clever Cloud
DATABASE_URL=postgresql://usuario:password@host:puerto/nombre_bd

# JWT
JWT_SECRET=cambia_este_valor_en_produccion
JWT_EXPIRATION=8h

# Servidor
PORT=3000
FRONTEND_URL=http://localhost:4200

# Seguridad
BCRYPT_ROUNDS=12

# Facturación Colombia
COMPANY_NIT=900000000-0
```

### Frontend (`.env.example`)

```env
# URL del backend desplegado en Vercel
VITE_API_URL=https://hermes-pos-backend.vercel.app
```

> **Nunca hardcodear credenciales en el código.**
> Todas las variables de entorno se configuran en el dashboard de Vercel.

---

## 11. CONFIGURACIÓN TAILWIND CSS 4.0 + FLOWBITE

> Tailwind CSS 4.0 usa enfoque **CSS-first**. No existe `tailwind.config.js`.

```css
/* src/styles.css */
@import 'tailwindcss';
@import 'flowbite';
```

```typescript
// src/main.ts
import 'flowbite';
```

```typescript
// src/app/app.config.ts
// Registrar componentes Flowbite según documentación oficial v2+
```

---

## 12. CONFIGURACIÓN VERCEL

### Backend (`vercel.json`)

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

### Frontend (`vercel.json`)

```json
{
  "outputDirectory": "dist/hermes-pos-frontend/browser",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 13. FLUJO DE TRABAJO — 10 ETAPAS

> Cada etapa requiere aprobación explícita antes de continuar.

### Etapa 1 — Modelado del Dominio
**Entregables:**
- Diagrama ERD en formato Mermaid
- Tabla de entidades con tipos PostgreSQL completos
- Listado de relaciones y cardinalidades

### Etapa 2 — Esquema PostgreSQL (Clever Cloud)
**Entregables:**
- `schema.sql` ejecutable en Clever Cloud
- `seed.sql` con datos de prueba (10 productos, 3 clientes, 2 usuarios)
- Documentación de configuración de `DATABASE_URL` en Vercel

### Etapa 3 — Configuración Backend NestJS 11.0.16
**Entregables:**
- Proyecto NestJS ejecutable (`npm run start:dev`)
- `.env.example` documentado
- `vercel.json` configurado para serverless

### Etapa 4 — Módulos, Servicios y Controladores
**Entregables:**
- API REST funcional con DTOs validados (`class-validator`)
- Filtro global de excepciones con mensajes amigables
- Interceptor global de formato de respuesta `{ data, message, statusCode }`

### Etapa 5 — Autenticación y Autorización (RBAC)
**Entregables:**
- `POST /auth/login` que retorna JWT con `{ userId, rol, nombre }`
- `JwtAuthGuard` y `RolesGuard` aplicados a todos los endpoints
- Decorador `@Roles()` en `src/common/decorators/`

### Etapa 6 — Generación de Facturas
**Entregables:**
- Endpoint `POST /invoices/generate` funcional
- PDF generado en memoria (buffer) compatible con Vercel serverless

### Etapa 7 — Frontend Angular 21.0.2 + Tailwind 4.0 + Flowbite
**Entregables:**
- Aplicación Angular funcional y responsiva
- `vercel.json` para SPA configurado
- Rutas protegidas por rol con redirección automática

### Etapa 8 — Pruebas Integrales
**Entregables:**
- Suite Jest para `SalesService`, `AuthService`, `InvoiceService`
- Pruebas e2e con Supertest para endpoints críticos
- Cobertura > 70 % en servicios críticos

### Etapa 9 — Documentación y Despliegue
**Entregables:**
- Swagger completo en `/api/docs`
- `README.md` completo en ambos repositorios
- Guía de despliegue Vercel + Clever Cloud

### Etapa 10 — Archivo agent.md *(este archivo)*
**Entregables:**
- `agent.md` completo, versionado en la raíz del repositorio
- Funciona como contexto standalone en Claude Code, Cursor o antigravity

---

## 14. CASOS EDGE Y RESTRICCIONES FINALES

### Stock
- `stock >= 0` forzado a nivel de BD (CHECK) y a nivel de servicio
- `SELECT ... FOR UPDATE` al verificar stock en transacciones concurrentes
- Número de factura via `SEQUENCE` de PostgreSQL (atómico por diseño)

### Productos
- Venta de producto vencido: **bloqueada** con mensaje amigable al usuario
- Producto próximo a vencer (≤ 30 días): **advertencia visible**, no bloqueo

### Serverless (Vercel)
- PDF siempre en memoria (buffer), nunca `fs.writeFileSync`
- Tiempo de ejecución máximo: 10 segundos por función
- Variables de entorno: solo desde el dashboard de Vercel

### Seguridad
- Passwords: nunca en texto plano, siempre `bcrypt` con `rounds = 12`
- JWT payload: `{ userId, rol, nombre }` — nunca incluir el hash del password
- CORS restringido al origen del frontend (`FRONTEND_URL`)

---

*Veterinaria Hermes — Sistema POS v3.0 — Colombia*
*Archivo generado para uso en Claude Code / Cursor / antigravity*

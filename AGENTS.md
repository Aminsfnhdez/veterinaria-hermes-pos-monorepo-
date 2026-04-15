# AGENTS.md - Veterinaria Hermes POS

> **Uso:** Este archivo es el contexto principal para agentes de desarrollo (OpenCode, Claude Code, Cursor).
> Cárgalo al inicio de cada sesión. No contiene credenciales ni connection strings reales.

---

## Estado del Proyecto

| Etapa | Estado |
|-------|--------|
| 1-3 | ✅ Completadas (Modelado, Schema, Config) |
| 4 | ✅ Completada (Módulos, Servicios, Controladores) |
| 5 | ✅ Completada (Auth JWT + RBAC) |
| 6 | ✅ Completada (Facturación PDF en memoria) |
| 7 | ✅ Completada (Frontend Angular + Tailwind + Flowbite) |
| 8 | ✅ Completada (Tests Jest: 51 unit tests, >80% cobertura servicios críticos) |
| 9 | ✅ Completada (Swagger /api/docs, READMEs, Deploy Vercel + Clever Cloud) |
| 10 | ⏳ Pendiente (Consolidación final) |

### Cobertura de Tests (Etapa 8)

| Servicio | Tests | Statements | Branches |
|----------|-------|------------|----------|
| AuthService | 8 | 100% | 80% |
| SalesService | 21 | 100% | 88.88% |
| ProductsService | 14 | 100% | 85.71% |
| InvoicesService | 14 | 44.82% | 65.62% |

**Nota e2e:** Los tests e2e requieren configuración de BD adicional debido al límite de conexiones de Clever Cloud. Documentado, no crítico para v1.

**Commits Etapas 7-9:** 28 commits (21 en Etapa 7 + 5 en Etapa 8 + 2 en Etapa 9)

---

## 1. IDENTIDAD Y ROL

Arquitecto de software senior especializado en sistemas empresariales veterinarios. Diseñar e implementar el sistema POS completo para **Veterinaria Hermes** (Colombia) siguiendo estrictamente este archivo.

**Nunca tomes decisiones que contradigan una regla definida aquí.** Si hay conflicto, detente y pregunta.

---

## 2. CONTEXTO DEL NEGOCIO

| Campo | Valor |
|---|---|
| IVA | 19% por defecto en todos los productos |
| Facturación | Electrónica compatible con DIAN (simulada en v1) |
| CUFE | SHA-256 simulado |
| NIT empresa | Variable de entorno `COMPANY_NIT` |
| Base de datos | PostgreSQL en Clever Cloud |
| Despliegue | Vercel (frontend y backend) |

### Reglas de productos próximos a vencer

- Advertir (sin bloquear) si `fechaCaducidad <= hoy + 30 días`
- **Bloquear venta** si `fechaCaducidad < hoy`

### Lote y caducidad por categoría

| Categoría | Lote | Fecha caducidad |
|---|---|---|
| Medicamento | Obligatorio | Obligatoria |
| Alimento | Opcional | Obligatoria |
| Accesorio | No aplica | No aplica |

---

## 3. STACK TÉCNICO (INAMOVIBLE)

```
Frontend:       Angular 21.0.2
Estilos:        Tailwind CSS 4.0 + Flowbite
Backend:        NestJS 11.0.16
ORM:            TypeORM
Base de datos:  PostgreSQL (Clever Cloud)
Despliegue:     Vercel
```

### Alternativas PROHIBIDAS

| Capa | Prohibido |
|---|---|
| Frontend | React, Vue, Svelte, cualquier otro |
| Estilos | Bootstrap, Material UI, Daisy UI, Chakra UI |
| Backend | Express, Fastify, Hono, cualquier otro |
| ORM | Prisma, Drizzle, Sequelize |
| BD | MySQL, MongoDB, SQLite, Supabase |
| Despliegue | Docker, Railway, Render, Heroku |

---

## 4. MODELO DE DATOS

### Entidades

| Entidad | Atributos clave |
|---|---|
| **Producto** | id (UUID), nombre, descripcion, categoria (enum), precio, stock, stockMinimo, lote?, fechaCaducidad?, activo |
| **Cliente** | id (UUID), nombre, identificacion (UNIQUE), telefono, email, nombreMascota?, tipoMascota? |
| **Usuario** | id (UUID), email (UNIQUE), passwordHash, nombre, rol (enum), activo |
| **Venta** | id (UUID), fecha, subtotal, iva, total, estado (enum), clienteId, usuarioId |
| **ItemVenta** | id (UUID), cantidad, precioUnitario, subtotal, ivaItem (= subtotal × 0.19), productoId, ventaId |
| **Factura** | id (UUID), numeroFactura (FE-YYYY-NNNNNN, UNIQUE), metodoPago (enum), cufe?, ventaId (1:1) |

### ENUMs PostgreSQL

```sql
CREATE TYPE categoriaproducto AS ENUM ('MEDICAMENTO', 'ALIMENTO', 'ACCESORIO');
CREATE TYPE estadoventa       AS ENUM ('PENDIENTE', 'COMPLETADA', 'ANULADA');
CREATE TYPE rolusuario        AS ENUM ('ADMIN', 'VENDEDOR');
CREATE TYPE metodopago        AS ENUM ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA');
```

### Restricciones críticas

- `stock >= 0` (CHECK en BD + validación en servicio)
- `SELECT ... FOR UPDATE` en transacciones de venta
- Número de factura via `SEQUENCE` PostgreSQL (atómico)
- Passwords: `bcrypt` con `rounds = 12`

---

## 5. ARQUITECTURA DEL PROYECTO

```
veterinaria-hermes-pos/
├── backend/                    # NestJS
│   ├── src/
│   │   ├── auth/              # Login, JWT, Guards
│   │   ├── products/          # CRUD productos
│   │   ├── clients/           # CRUD clientes
│   │   ├── users/             # Gestión usuarios
│   │   ├── sales/             # Transacciones de venta
│   │   ├── invoices/          # Facturación, PDF
│   │   ├── common/            # Decorators, Guards, Filters, Interceptors
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── schema.sql
│   ├── seed.sql
│   └── vercel.json
├── frontend/                   # Angular 21
│   ├── src/app/
│   │   ├── auth/              # Login
│   │   ├── pos/               # Punto de venta
│   │   ├── inventory/         # Inventario
│   │   ├── invoices/          # Facturas
│   │   └── shared/            # Servicios compartidos
│   └── vercel.json
├── agent.md                    # Contexto completo (mantener)
└── AGENTS.md                   # Este archivo
```

---

## 6. REGLAS DE NEGOCIO CRÍTICAS

### Integridad de stock

```
NUNCA permitir stock negativo.
- CHECK constraint en PostgreSQL
- Validación en SalesService antes de transacción
- SELECT ... FOR UPDATE para evitar race conditions
```

### Lógica de venta (SalesService.createSale)

```
1. Recibir [{ productoId, cantidad }]
2. BEGIN transacción
3. Para cada producto: SELECT FOR UPDATE → si stock < cantidad → ROLLBACK
4. Calcular subtotal, IVA (19%), total
5. INSERT Venta + ItemVenta
6. UPDATE stock productos
7. COMMIT
8. Retornar venta con ID
```

### Matriz de permisos (RBAC)

| Acción | ADMIN | VENDEDOR |
|---|---|---|
| Leer productos | ✓ | ✓ |
| Crear/editar/eliminar productos | ✓ | ✗ |
| Anular venta | ✓ | ✗ |
| Generar factura | ✓ | ✓ |
| Gestionar usuarios | ✓ | ✗ |
| Ver reportes/alertas inventario | ✓ | ✗ |

### Reglas adicionales

- Factura cancelada **no restaura stock** automáticamente
- Número de factura **inmutable** una vez generado
- Usuario inactivo (`activo=false`) **no puede iniciar sesión**
- PDF generado en **memoria** (buffer), nunca escribir en disco
- Tiempo máximo Vercel: **10 segundos**

---

## 7. FLUJO DE TRABAJO POR ETAPAS

> **REGLA CRÍTICA:** Nunca avances a la siguiente etapa sin aprobación explícita del usuario.

1. **Etapa 1** - Modelado del Dominio (ERD, entidades)
2. **Etapa 2** - Esquema PostgreSQL (schema.sql, seed.sql)
3. **Etapa 3** - Configuración Backend NestJS
4. **Etapa 4** - Módulos, Servicios, Controladores
5. **Etapa 5** - Autenticación y Autorización (JWT, RBAC)
6. **Etapa 6** - Generación de Facturas (PDF en memoria)
7. **Etapa 7** - Frontend Angular + Tailwind + Flowbite
8. **Etapa 8** - Pruebas (Jest, Cobertura > 70%)
9. **Etapa 9** - Documentación y Despliegue
10. **Etapa 10** - Consolidación final

---

## 8. REGLAS DE GIT (Conventional Commits)

### Formato

```
<tipo>(<alcance>): <descripción en español>
```

### Tipos permitidos

`feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`

### Commits granulares

| Regla | Límite |
|---|---|
| Archivos modificados | Máximo 5 |
| Líneas cambiadas | ~150 máximo |
| Mezcla de capas | **Prohibido** |

### Ejemplos correctos

```bash
feat(auth): agregar endpoint POST /auth/login con JWT
feat(products): crear entidad Product con TypeORM
fix(sales): aplicar ROLLBACK cuando stock insuficiente
chore(db): agregar schema.sql con tablas y ENUMs
docs(api): documentar endpoint POST /invoices/generate
```

### Ejemplos PROHIBIDOS

```bash
# PROHIBIDO — demasiado amplio
feat: implementar todo el módulo de ventas

# PROHIBIDO — mezcla capas
feat: agregar ventas backend y carrito frontend

# PROHIBIDO — tipo inválido
update(products): actualizar producto
```

---

## 9. GENERACIÓN DE CÓDIGO (CLI OBLIGATORIO)

> **Nunca crear archivos de código manualmente.**

### Angular CLI

```bash
ng generate module <nombre> --routing
ng generate component <nombre> --module=<modulo>
ng generate service services/<nombre>
ng generate guard guards/<nombre>
ng generate interceptor interceptors/<nombre>
ng generate interface models/<nombre>
```

### NestJS CLI

```bash
nest generate module <nombre>
nest generate controller <modulo>/<nombre>-controller
nest generate service <modulo>/<nombre>-service
nest generate guard common/guards/<nombre>-guard
nest generate interceptor common/interceptors/<nombre>-interceptor
nest generate class <modulo>/dto/<nombre>-dto --no-spec
nest generate class <modulo>/entities/<nombre>-entity --no-spec
```

---

## 10. BUILD/LINT/TEST COMMANDS

### Backend (NestJS)

```bash
cd backend

# Build
npm run build                    # Compilar TypeScript
npm run start:dev               # Desarrollo con watch
npm run start:prod              # Producción (dist/main.js)

# Lint
npm run lint                    # ESLint --fix

# Test
npm test                        # Jest (todas)
npm test -- src/app.controller.spec.ts    # Un archivo
npm run test:watch             # Watch mode
npm run test:cov               # Coverage

# Formato
npm run format                  # Prettier write
```

### Frontend (Angular 21)

```bash
cd frontend

# Build
npm run build                   # Producción
npm run build -- --configuration development  # Dev

# Serve
npm start                       # ng serve
ng serve --open                # Abrir navegador

# Test
ng test                         # Vitest (todas)
ng test src/app/app.component.spec.ts --run  # Un archivo
```

---

## 11. CONVENCIONES DE CÓDIGO

### TypeScript

- Tipos explícitos; evitar `any` (ESLint lo advierte en backend)
- Interfaces para objetos; types para uniones/primitivos
- Compilación TypeScript en modo strict

### Nomenclatura

- Clases: PascalCase (`AppController`, `UserService`)
- Funciones/variables: camelCase (`getUserById`)
- Constantes: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- Archivos: kebab-case (`user-service.ts`), PascalCase para clases

### Imports

1. Módulos Node (fs, path)
2. Paquetes externos (@nestjs/*, express)
3. Módulos internos (./, ../)
4. Type imports primero

### NestJS

- Usar `readonly` para dependencias inyectadas no modificadas
- DTOs como clases (no interfaces) para validación

### Angular

- Componentes standalone
- Señales para estado reactivo (Angular 21)
- `inject()` en lugar de constructor injection
- OnPush change detection strategy

### Prettier

- Print width: 100
- Single quotes: true
- End of line: auto
- Trailing commas: all

---

## 12. VARIABLES DE ENTORNO

### Backend

```env
DATABASE_URL=postgresql://usuario:password@host:puerto/nombre_bd
JWT_SECRET=cambia_este_valor_en_produccion
JWT_EXPIRATION=8h
PORT=3000
FRONTEND_URL=http://localhost:4200
BCRYPT_ROUNDS=12
COMPANY_NIT=900000000-0
```

### Frontend

```env
VITE_API_URL=https://hermes-pos-backend.vercel.app
```

---

*Veterinaria Hermes — Sistema POS*
*Colombia | IVA 19% | Facturación DIAN (simulada)*

# Veterinaria Hermes POS

> Sistema de punto de venta completo para clínica y tienda veterinaria en Colombia con facturación electrónica simulada (DIAN), control de inventario, alertas de stock y caducidad, y RBAC.

Veterinaria Hermes POS es una aplicación web full-stack diseñada para gestionar ventas, inventario de productos veterinarios (medicamentos, alimentos, accesorios), facturación PDF en memoria y control de acceso por roles (ADMIN / VENDEDOR). Cumple con IVA 19% y reglas de negocio específicas del sector veterinario colombiano.

---

## Índice

- [Características](#características)
- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Flujo principal del usuario](#flujo-principal-del-usuario)
- [Estructura del proyecto](#estructura-del-proyecto)
- [API Reference](#api-reference)
- [Base de datos](#base-de-datos)
- [Variables de entorno](#variables-de-entorno)
- [Instalación y desarrollo local](#instalación-y-desarrollo-local)
- [Despliegue](#despliegue)
- [Convención de commits](#convención-de-commits)
- [Estado del proyecto](#estado-del-proyecto)
- [Decisiones técnicas](#decisiones-técnicas)

---

## Características

- **Autenticación JWT** con RBAC (ADMIN / VENDEDOR).
- **Punto de venta completo** con búsqueda de productos, carrito dinámico, cálculo automático de IVA 19% y generación de factura.
- **Control de inventario** con categorías específicas (medicamento, alimento, accesorio), lote, fecha de caducidad y stock mínimo.
- **Alertas inteligentes** — stock bajo, próximos a vencer (30 días), vencidos.
- **Facturación PDF** generada en memoria (buffer) compatible con Vercel serverless.
- **CRUD productos** — validaciones por categoría, bloqueo de ventas de productos vencidos.
- **Rutas protegidas** — ADMIN gestiona inventario, VENDEDOR solo ventas.
- **Responsive** con Tailwind CSS 4.0 y Flowbite.
- **PostgreSQL** en Clever Cloud con transacciones para integridad de stock.
- **Despliegue** en Vercel (frontend + backend).

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | Angular 21.0.2 (standalone components, signals) |
| **Estilos** | Tailwind CSS 4.0 (CSS-first, PostCSS) + Flowbite |
| **Backend** | NestJS 11.0.16 |
| **ORM** | TypeORM |
| **Base de datos** | PostgreSQL (Clever Cloud) |
| **Autenticación** | JWT + Guards |
| **Facturación** | pdfkit (PDF en memoria) |
| **Despliegue** | Vercel (SPA frontend + serverless backend) |
| **Control de versiones** | Conventional Commits (español) |

---

## Arquitectura del proyecto

```mermaid
flowchart TB
    subgraph Frontend ["Frontend - Angular 21"]
        UI[Componentes standalone<br/>Navbar, Sidebar, POS]
        AuthF[Login<br/>AuthService + Guards]
        ServicesF[ProductService, SaleService<br/>HttpClient + Interceptor]
    end

    subgraph Backend ["Backend - NestJS 11"]
        AuthB[AuthController<br/>JWT Strategy]
        Products[ProductsController<br/>CRUD + Alertas]
        Sales[SalesController<br/>Transacción + Stock]
        Invoices[InvoicesController<br/>PDF Buffer]
        Common[Guards, Interceptors<br/>RBAC, ResponseFormat]
    end

    subgraph DB ["PostgreSQL - Clever Cloud"]
        Entities[(Producto<br/>Cliente, Venta<br/>Factura, Usuario)]
    end

    UI --> AuthF
    AuthF --> ServicesF
    ServicesF -.-> AuthB
    ServicesF -.-> Products
    ServicesF -.-> Sales
    ServicesF -.-> Invoices
    AuthB --> Entities
    Products --> Entities
    Sales --> Entities
    Invoices --> Entities
```

---

## Flujo principal del usuario

```
1. Usuario accede a /login
        ↓
2. ADMIN o VENDEDOR inicia sesión con JWT
        ↓
3. Redirect automático según rol:
   ADMIN → /inventory/alerts
   VENDEDOR → /pos
        ↓
4. En POS (/pos):
   - Búsqueda de productos (autocomplete)
   - Selección de cliente
   - Agregar al carrito (cantidad, precio)
   - Cálculo automático: subtotal + IVA 19% = total
   - Crear venta → backend transacción
        ↓
5. Backend:
   - Verifica stock (SELECT FOR UPDATE)
   - Si OK → INSERT venta/items + UPDATE stock
   - Genera factura PDF (buffer)
        ↓
6. Frontend muestra factura + descarga PDF
```

```
Flujo ADMIN adicional:
1. /inventory/products → lista con filtros
2. /inventory/products/new → crear producto
3. /inventory/alerts → dashboard stock bajo/vencidos
```

---

## Estructura del proyecto

```
veterinaria-hermes-pos/
├── backend/                    # NestJS 11.0.16
│   ├── src/
│   │   ├── auth/               # JWT + Guards
│   │   ├── products/           # CRUD + Alertas
│   │   ├── clients/            # CRUD Clientes
│   │   ├── sales/              # Transacciones
│   │   ├── invoices/           # Facturación PDF
│   │   ├── common/             # Guards, Interceptors
│   │   └── app.module.ts
│   ├── schema.sql
│   ├── seed.sql
│   └── vercel.json
├── frontend/                   # Angular 21.0.2
│   ├── src/app/
│   │   ├── auth/login/
│   │   ├── pos/components/
│   │   ├── inventory/components/
│   │   ├── invoices/components/
│   │   ├── shared/
│   │   ├── app.routes.ts
│   │   └── app.config.ts
│   ├── postcss.config.mjs
│   └── vercel.json
├── AGENTS.md                   # Reglas del proyecto
├── agent.md                    # Contexto agente
└── README.md                   # Este archivo
```

---

## API Reference

### `POST /auth/login`
```json
{
  "email": "admin@hermes.com",
  "password": "password"
}
```
**Respuesta:**
```json
{
  "access_token": "eyJ...",
  "user": { "id": "...", "rol": "ADMIN", "nombre": "Admin" }
}
```

### `POST /sales`
**Body:** `{ "clienteId": "...", "items": [{ "productoId": "...", "cantidad": 2 }] }`
**Backend:** Transacción atómica + PDF buffer.

### `GET /products/alerts`
**Respuesta:** `{ "bajoStock": [...], "porVencer": [...], "vencidos": [...] }`

---

## Base de datos

**PostgreSQL en Clever Cloud** con entidades:

| Entidad | Campos clave |
|---------|--------------|
| **Producto** | id, nombre, categoria, precio, stock, stockMinimo, lote?, fechaCaducidad?, activo |
| **Cliente** | id, nombre, identificacion (NIT/CC), telefono, email |
| **Venta** | id, fecha, subtotal, iva, total, estado, clienteId, usuarioId |
| **ItemVenta** | cantidad, precioUnitario, productoId, ventaId |
| **Factura** | numeroFactura (FE-YYYY-NNNNNN), ventaId |
| **Usuario** | id, email, passwordHash, rol (ADMIN/VENDEDOR), activo |

**ENUMs:** `categoriaproducto`, `estadoventa`, `rolusuario`, `metodopago`.

**Restricciones:** `CHECK (stock >= 0)`.

---

## Variables de entorno

### Backend `.env.example`
```env
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=cambiaestevalorenproduccion
JWT_EXPIRATION=8h
PORT=3000
FRONTEND_URL=http://localhost:4200
BCRYPT_ROUNDS=12
COMPANY_NIT=900000000-0
```

### Frontend `environment.ts`
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

---

## Instalación y desarrollo local

### Backend
```bash
cd backend
npm install
npm run start:dev    # http://localhost:3000
```

### Frontend
```bash
cd frontend
npm install
ng serve             # http://localhost:4200
```

### Base de datos
1. Configura `DATABASE_URL` en Clever Cloud.
2. Ejecuta `schema.sql` y `seed.sql`.

---

## Despliegue

### Vercel (Frontend + Backend)
1. Push a GitHub.
2. Conecta repositorio en Vercel.
3. Configura variables de entorno.
4. **Frontend:** `outputDirectory: dist/hermes-pos-frontend/browser`
5. **Backend:** Framework Preset: `Other` + `npm run build && npm start`

**URLs finales:**
- Frontend: `https://hermes-pos-frontend.vercel.app`
- Backend: `https://hermes-pos-backend.vercel.app`

---

## Convención de commits

**Conventional Commits en español:**

| Tipo | Cuándo |
|------|--------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de error |
| `refactor` | Refactorización |
| `test` | Pruebas |
| `docs` | Documentación |
| `chore` | Configuración |

**Granularidad:** Máximo 5 archivos, 150 líneas, una responsabilidad por commit.

**Ejemplos:**
```
feat(pos): crear SalePointComponent
feat(inventory): agregar alertas de stock bajo
chore(frontend): configurar Tailwind CSS 4
```

---

## Estado del proyecto

| Etapa | Estado | Descripción |
|-------|--------|-------------|
| 1 | ✅ | Modelado del dominio |
| 2 | ✅ | Esquema PostgreSQL |
| 3 | ✅ | Configuración NestJS |
| 4 | ✅ | Módulos y controladores |
| 5 | ✅ | Autenticación RBAC |
| 6 | ✅ | Facturación PDF |
| 7 | ✅ | Frontend Angular + Tailwind |
| 8 | ✅ | Tests Jest (51 unit, >80% cobertura) |
| 9 | ✅ | Documentación y Despliegue |
| 10 | ⏳ | Consolidación final |

---

## Decisiones técnicas

| Decisión | Razón |
|----------|-------|
| **Angular standalone** | Angular 21 nativo, signals reactivos, sin NgModules. |
| **Tailwind 4 PostCSS** | CSS-first oficial, sin Vite plugin innecesario. |
| **Flowbite vanilla CSS** | Compatible con Angular, evita dependencias frágiles. |
| **PDF en memoria** | Vercel serverless, pdfkit buffer (sin `fs.writeFile`). |
| **Transacciones stock** | `SELECT FOR UPDATE` + `ROLLBACK` en ventas concurrentes. |
| **JWT + Guards** | RBAC simple y efectivo. |
| **Docker prohibido** | Vercel serverless nativo. |
| **CLI obligatorio** | Angular CLI y NestJS CLI para todo. |

---

**Estado actual:** Etapa 9 completada. Swagger en `/api`, READMEs completos. Listo para **Etapa 10 - Consolidación final**.
# Hermes POS Frontend

> Sistema de punto de venta para Veterinaria Hermes - Frontend Angular

## Stack Tecnológico

| Tecnología | Versión |
|------------|---------|
| Angular | 21.0.2 |
| Componentes | Standalone |
| Estado | Signals |
| Estilos | Tailwind CSS 4.0 |
| UI | Flowbite |
| HTTP | HttpClient |

## Instalación

```bash
# Instalar dependencias
npm install

# Copiar archivo de variables de entorno
cp .env.example .env
```

### Variables de Entorno (.env)

```env
# URL del backend
VITE_API_URL=http://localhost:3000
```

## Desarrollo

```bash
# Servidor de desarrollo
ng serve

# Abrir navegador automáticamente
ng serve --open

# URL del servidor
http://localhost:4200
```

## Build

```bash
# Build producción
ng build

# Build desarrollo
ng build --configuration development

# Output
dist/hermes-pos-frontend/browser
```

## Componentes

### Páginas

| Componente | Ruta | Descripción | Acceso |
|------------|------|-------------|---------|
| LoginComponent | /login | Login de usuarios | Público |
| SalePointComponent | /pos | Punto de venta | ADMIN, VENDEDOR |
| InventoryListComponent | /inventory | Inventario productos | ADMIN |
| InvoiceListComponent | /invoices | Lista facturas | ADMIN, VENDEDOR |
| InvoiceViewComponent | /invoices/:id | Ver/descargar PDF | ADMIN, VENDEDOR |
| AlertsDashboardComponent | /alertas | Alertas inventario | ADMIN |

### Servicios

| Servicio | Descripción |
|----------|-------------|
| AuthService | Login, JWT, logout |
| ProductsService | CRUD productos |
| ClientsService | CRUD clientes |
| SalesService | Crear/listar ventas |
| InvoicesService | Facturas, PDF |
| AlertsService | Alertas stock |

## Rutas Protegidas

### Por Rol

| Ruta | ADMIN | VENDEDOR |
|------|-------|-----------|
| /login | ✓ | ✓ |
| /pos | ✓ | ✓ |
| /invoices | ✓ | ✓ |
| /invoices/:id | ✓ | ✓ |
| /inventory | ✓ | ✗ |
| /alertas | ✓ | ✗ |

### Flujo de Redirección

- ADMIN → /inventory
- VENDEDOR → /pos
- No autenticado → /login

## Despliegue Vercel

### 1. Conectar repositorio

1. Ir a [Vercel](https://vercel.com)
2. Importar repositorio GitHub
3. Seleccionar carpeta `frontend`

### 2. Configurar Variables

En Vercel Dashboard → Settings → Environment Variables:

```env
VITE_API_URL=https://hermes-pos-backend.vercel.app
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
  "framework": "angular",
  "buildCommand": "npm run build",
  "outputDirectory": "dist/hermes-pos-frontend/browser"
}
```

## Funcionalidades

### Punto de Venta (/pos)

- Búsqueda de productos por nombre
- Carrito dinámico (agregar/eliminar items)
- Cálculo automático de subtotal, IVA 19%, total
- Selección de cliente
- Checkout → crea venta + redirect a factura

### Inventario (/inventory)

- Lista de productos con filtros
- CRUD completo (ADMIN)
- Indicadores visuales:
  - 🟢 Stock OK
  - 🟡 Bajo stock
  - 🔴 Vencido

### Alertas (/alertas)

- Productos con stock bajo (stock <= stockMinimo)
- Productos próximos a vencer (30 días)
- Productos vencidos
- Acciones rápidas: editar stock

### Facturas (/invoices)

- Lista de facturas
- Ver detalle
- Descargar PDF
- Enlace directo desde venta completada

## UI/UX

### Diseño

- **Tailwind CSS 4.0**: CSS-first config
- **Flowbite**: Componentes preconstruidos
- **Responsive**: Mobile-first
- **Modo oscuro**: No implementado en v1

### Colores

- Primario: Emerald (veterinario)
- Fondo: Blanco/Gris claro
- Texto: Gris oscuro

## Licencia

MIT
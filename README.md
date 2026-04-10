# Veterinaria Hermes POS

Sistema de Punto de Venta (POS) para **Veterinaria Hermes**, Colombia.

## Propósito

Gestión integral de ventas, inventario, clientes y facturación electrónica para clínica y tienda veterinaria. IVA 19%, facturación DIAN (simulada en v1).

## Estructura del proyecto

```
veterinaria-hermes-pos/
├── backend/          # NestJS REST API
├── frontend/         # Angular 21 SPA
├── agent.md         # Contexto completo del proyecto
└── AGENTS.md        # Guía para agentes de desarrollo
```

## Stack técnico

| Capa | Tecnología |
|---|---|
| Frontend | Angular 21.0.2 + Tailwind CSS 4.0 + Flowbite |
| Backend | NestJS 11.0.16 + TypeORM |
| Base de datos | PostgreSQL (Clever Cloud) |
| Despliegue | Vercel |

## Cómo correr

### Backend

```bash
cd backend
npm install
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Reglas de commits

Formato: `tipo(alcance): descripción en español`

Tipos: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`

Commits pequeños y granulares. Máximo 5 archivos por commit.

## Contexto para agentes

El archivo **`AGENTS.md`** es el contexto principal que deben cargar los agentes de desarrollo (OpenCode, Claude Code, Cursor) al inicio de cada sesión.

-- Veterinaria Hermes POS — esquema PostgreSQL (Clever Cloud)
-- Requisitos: PostgreSQL 13+ (gen_random_uuid() nativo). Ejecutar preferiblemente sobre una base nueva vacía.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tipos enumerados (nombres según Etapa 2)
CREATE TYPE categoriaproducto AS ENUM ('MEDICAMENTO', 'ALIMENTO', 'ACCESORIO');
CREATE TYPE estadoventa AS ENUM ('PENDIENTE', 'COMPLETADA', 'ANULADA');
CREATE TYPE rolusuario AS ENUM ('ADMIN', 'VENDEDOR');
CREATE TYPE metodopago AS ENUM ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA');

-- Numeración atómica para factura (prefijo FE-YYYY- en aplicación; secuencia para el correlativo)
CREATE SEQUENCE facturaseq START 1;

CREATE TABLE producto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  categoria categoriaproducto NOT NULL,
  precio NUMERIC(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER NOT NULL DEFAULT 0,
  lote VARCHAR(128),
  fecha_caducidad DATE,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_producto_stock_positivo CHECK (stock >= 0)
);

CREATE TABLE cliente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  identificacion VARCHAR(32) NOT NULL,
  telefono VARCHAR(64),
  email VARCHAR(255),
  nombre_mascota VARCHAR(255),
  tipo_mascota VARCHAR(128),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_cliente_identificacion UNIQUE (identificacion)
);

CREATE TABLE usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  rol rolusuario NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_usuario_email UNIQUE (email)
);

CREATE TABLE venta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  iva NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  estado estadoventa NOT NULL DEFAULT 'PENDIENTE',
  cliente_id UUID NOT NULL REFERENCES cliente (id) ON DELETE RESTRICT,
  usuario_id UUID NOT NULL REFERENCES usuario (id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE item_venta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario NUMERIC(10, 2) NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  iva_item NUMERIC(10, 2) NOT NULL,
  producto_id UUID NOT NULL REFERENCES producto (id) ON DELETE RESTRICT,
  venta_id UUID NOT NULL REFERENCES venta (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE factura (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_factura VARCHAR(32) NOT NULL,
  fecha_emision TIMESTAMPTZ NOT NULL DEFAULT now(),
  metodo_pago metodopago NOT NULL,
  cufe VARCHAR(128),
  venta_id UUID NOT NULL REFERENCES venta (id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_factura_numero UNIQUE (numero_factura),
  CONSTRAINT uq_factura_venta UNIQUE (venta_id)
);

CREATE INDEX idx_producto_nombre ON producto (nombre);
CREATE INDEX idx_venta_fecha ON venta (fecha);
-- cliente.identificacion: el UNIQUE anterior crea índice único automáticamente (equivalente a índice solicitado).

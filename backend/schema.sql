-- Veterinaria Hermes POS - Schema PostgreSQL
-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ENUMs
DO $$ BEGIN
    CREATE TYPE categoriaproducto AS ENUM ('MEDICAMENTO', 'ALIMENTO', 'ACCESORIO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE estadoventa AS ENUM ('PENDIENTE', 'COMPLETADA', 'ANULADA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE rolusuario AS ENUM ('ADMIN', 'VENDEDOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE metodopago AS ENUM ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabla usuario
CREATE TABLE IF NOT EXISTS usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    passwordHash VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    rol rolusuario NOT NULL DEFAULT 'VENDEDOR',
    activo BOOLEAN NOT NULL DEFAULT true,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla cliente
CREATE TABLE IF NOT EXISTS cliente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    identificacion VARCHAR(50) NOT NULL UNIQUE,
    telefono VARCHAR(50),
    email VARCHAR(255),
    nombreMascota VARCHAR(255),
    tipoMascota VARCHAR(100),
    activo BOOLEAN NOT NULL DEFAULT true,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla producto
CREATE TABLE IF NOT EXISTS producto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria categoriaproducto NOT NULL,
    precio NUMERIC(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    stockMinimo INTEGER NOT NULL DEFAULT 0,
    lote VARCHAR(100),
    fechaCaducidad DATE,
    activo BOOLEAN NOT NULL DEFAULT true,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_stock_positivo CHECK (stock >= 0)
);

-- Tabla venta
CREATE TABLE IF NOT EXISTS venta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    subtotal NUMERIC(10, 2) NOT NULL,
    iva NUMERIC(10, 2) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    estado estadoventa NOT NULL DEFAULT 'COMPLETADA',
    clienteId UUID REFERENCES cliente(id),
    usuarioId UUID REFERENCES usuario(id) NOT NULL,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla itemVenta
CREATE TABLE IF NOT EXISTS itemventa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cantidad INTEGER NOT NULL,
    precioUnitario NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    ivaItem NUMERIC(10, 2) NOT NULL,
    productoId UUID REFERENCES producto(id) NOT NULL,
    ventaId UUID REFERENCES venta(id) NOT NULL,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla factura
CREATE TABLE IF NOT EXISTS factura (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numeroFactura VARCHAR(20) NOT NULL UNIQUE,
    metodoPago metodopago NOT NULL,
    cufe VARCHAR(255),
    ventaId UUID REFERENCES venta(id) NOT NULL,
    fechaEmision TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sequences para números de factura
CREATE SEQUENCE IF NOT EXISTS factura_numero_seq START 1;

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_producto_categoria ON producto(categoria);
CREATE INDEX IF NOT EXISTS idx_producto_activo ON producto(activo);
CREATE INDEX IF NOT EXISTS idx_venta_fecha ON venta(fecha);
CREATE INDEX IF NOT EXISTS idx_venta_estado ON venta(estado);
CREATE INDEX IF NOT EXISTS idx_factura_venta ON factura(ventaId);

-- Trigger para actualizar updatedAt
CREATE OR REPLACE FUNCTION update_updatedAt_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuario_updatedAt
    BEFORE UPDATE ON usuario
    FOR EACH ROW EXECUTE FUNCTION update_updatedAt_column();

CREATE TRIGGER update_cliente_updatedAt
    BEFORE UPDATE ON cliente
    FOR EACH ROW EXECUTE FUNCTION update_updatedAt_column();

CREATE TRIGGER update_producto_updatedAt
    BEFORE UPDATE ON producto
    FOR EACH ROW EXECUTE FUNCTION update_updatedAt_column();

CREATE TRIGGER update_venta_updatedAt
    BEFORE UPDATE ON venta
    FOR EACH ROW EXECUTE FUNCTION update_updatedAt_column();

CREATE TRIGGER update_factura_updatedAt
    BEFORE UPDATE ON factura
    FOR EACH ROW EXECUTE FUNCTION update_updatedAt_column();
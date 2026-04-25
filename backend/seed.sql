-- Veterinaria Hermes POS - Seed Data
-- Usuario admin: admin@hermes.com / admin123 (bcrypt hash de 'admin123')
-- El hash fue generado con: bcrypt.hash('admin123', 12)

INSERT INTO usuario (id, email, passwordHash, nombre, rol, activo)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'admin@hermes.com',
    '$2b$12$VAXZK65FGACDPNsFOcbneubFu8g3mW/1Z06HI.UVzvLlAwzagFd8u',
    'Administrador',
    'ADMIN',
    true
) ON CONFLICT (email) DO NOTHING;

-- Usuario vendedor
INSERT INTO usuario (id, email, passwordHash, nombre, rol, activo)
VALUES (
    'b1ffcd00-ad1c-5df9-cc7e-7cca0ce49122',
    'vendedor@hermes.com',
    '$2b$12$VAXZK65FGACDPNsFOcbneubFu8g3mW/1Z06HI.UVzvLlAwzagFd8u',
    'Vendedor Principal',
    'VENDEDOR',
    true
) ON CONFLICT (email) DO NOTHING;

-- Clientes de prueba
INSERT INTO cliente (id, nombre, identificacion, telefono, email, nombreMascota, tipoMascota, activo)
VALUES
    ('c2ggde11-be2d-6eg0-dd8f-8ddb1de50233', 'Juan Pérez', '12345678', '3001234567', 'juan@email.com', 'Max', 'Perro', true),
    ('d3hhef22-cf3e-7fh1-ee9g-9eec2ef61344', 'María García', '87654321', '3009876543', 'maria@email.com', 'Luna', 'Gato', true),
    ('e4iifg33-dg4f-8gi2-ff0h-0ffd3fg72455', 'Carlos Rodríguez', '11223344', '3005551234', 'carlos@email.com', 'Bobby', 'Perro', true)
ON CONFLICT (identificacion) DO NOTHING;

-- Productos de prueba
INSERT INTO producto (id, nombre, descripcion, categoria, precio, stock, stockMinimo, lote, fechaCaducidad, activo)
VALUES
    -- Medicamentos
    (
        'f5jjgh44-eh5g-9hj3-gg1i-1gge4gh83566',
        'Amoxicilina 500mg',
        'Antibiótico de amplio espectro',
        'MEDICAMENTO',
        25000.00,
        100,
        20,
        'LOTE-2024-001',
        '2027-12-31',
        true
    ),
    (
        'g6kkhi55-fi6h-0ik4-hh2j-2hhf5hi94677',
        'Ivermectina 6mg',
        'Antiparasitario',
        'MEDICAMENTO',
        15000.00,
        50,
        15,
        'LOTE-2024-002',
        '2026-06-15',
        true
    ),
    (
        'h7llij66-gj7i-1jl5-ii3k-3iii6ij05788',
        'Vacuna Antirrábica',
        'Vacuna para perros y gatos',
        'MEDICAMENTO',
        45000.00,
        30,
        10,
        'LOTE-2024-003',
        '2025-08-20',
        true
    ),
    -- Alimentos
    (
        'i8mmjk77-hk8j-2km6-jj4l-4jjj7jk16899',
        'Alimento Premium Perro 10kg',
        'Alimento balanceado para perros adultos',
        'ALIMENTO',
        85000.00,
        25,
        5,
        NULL,
        '2026-03-01',
        true
    ),
    (
        'j9nnkl88-il9k-3ln7-kk5m-5kkk8kl27900',
        'Alimento Gato 5kg',
        'Alimento premium para gatos',
        'ALIMENTO',
        55000.00,
        20,
        5,
        NULL,
        '2026-05-15',
        true
    ),
    -- Accesorios
    (
        'k8ooli99-jm0l-4mo8-ll6n-6lll9lm38011',
        'Collar Antiparasitario',
        'Collar repelente de pulgas y garrapatas',
        'ACCESORIO',
        35000.00,
        40,
        10,
        NULL,
        NULL,
        true
    ),
    (
        'l9ppmj00-kn1m-5np9-mm7o-7mmm0mn49122',
        'Cama Perro Mediana',
        'Cama acolchada para perros medianos',
        'ACCESORIO',
        75000.00,
        15,
        3,
        NULL,
        NULL,
        true
    )
ON CONFLICT DO NOTHING;

-- Reiniciar secuencia de factura
SELECT setval('factura_numero_seq', 1, true);
-- Veterinaria Hermes POS — datos de prueba (Etapa 2)
-- Ejecutar después de schema.sql sobre la misma base.
-- Contraseña de seed para ambos usuarios: HermesSeed2026!  (solo desarrollo; bcrypt 12 rounds)

BEGIN;

-- 2 usuarios (ADMIN y VENDEDOR; mismo hash de contraseña de prueba)
INSERT INTO usuario (id, email, password_hash, nombre, rol, activo, created_at, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111101', 'admin@hermes.vet',
   '$2b$12$FAHDRNpwE4HTe0LFXCIO7e26xX24wJ61p50/sx3Q.qzHvVg3qJJ3G',
   'Administrador Principal', 'ADMIN', true, now(), now()),
  ('22222222-2222-2222-2222-222222222202', 'vendedor@hermes.vet',
   '$2b$12$FAHDRNpwE4HTe0LFXCIO7e26xX24wJ61p50/sx3Q.qzHvVg3qJJ3G',
   'Vendedor Demo', 'VENDEDOR', true, now(), now());

-- 3 clientes
INSERT INTO cliente (id, nombre, identificacion, telefono, email, nombre_mascota, tipo_mascota, created_at, updated_at) VALUES
  ('33333333-3333-3333-3333-333333333301', 'María López', '1023456789', '3001112233', 'maria.lopez@correo.test', 'Luna', 'PERRO', now(), now()),
  ('33333333-3333-3333-3333-333333333302', 'Clínica Animal Sur NIT', '900123456-1', '6014445566', 'contacto@animal-sur.test', NULL, NULL, now(), now()),
  ('33333333-3333-3333-3333-333333333303', 'Carlos Gómez', '80123456', '3107778899', 'carlos.gomez@correo.test', 'Michi', 'GATO', now(), now());

-- 10 productos (medicamentos, alimentos, accesorios; stocks y caducidades variados)
INSERT INTO producto (
  id, nombre, descripcion, categoria, precio, stock, stock_minimo, lote, fecha_caducidad, activo, created_at, updated_at
) VALUES
  ('44444444-4444-4444-4444-444444444401', 'Amoxicilina 250 mg', 'Antibiótico uso veterinario', 'MEDICAMENTO', 28500.00, 120, 15, 'LOT-AMX-2025-01', '2026-12-31', true, now(), now()),
  ('44444444-4444-4444-4444-444444444402', 'Ivermectina 1%', 'Antiparasitario', 'MEDICAMENTO', 18000.00, 45, 10, 'LOT-IVM-2025-A', '2026-06-30', true, now(), now()),
  ('44444444-4444-4444-4444-444444444403', 'Metronidazol oral', 'Antiprotozoario', 'MEDICAMENTO', 22000.00, 0, 8, 'LOT-MTD-24-B', '2027-01-15', true, now(), now()),
  ('44444444-4444-4444-4444-444444444404', 'Royal Canin Mini Puppy 2 kg', 'Alimento cachorro raza pequeña', 'ALIMENTO', 95000.00, 30, 5, NULL, '2026-03-20', true, now(), now()),
  ('44444444-4444-4444-4444-444444444405', 'Proplan Adult Cat 3 kg', 'Alimento gato adulto', 'ALIMENTO', 112000.00, 18, 5, NULL, '2026-09-01', true, now(), now()),
  ('44444444-4444-4444-4444-444444444406', 'Hills CD Multicare 2 kg', 'Alimento prescrito vía veterinaria', 'ALIMENTO', 145000.00, 12, 4, NULL, '2025-04-15', true, now(), now()),
  ('44444444-4444-4444-4444-444444444407', 'Correa nylon mediana', 'Correa retráctil', 'ACCESORIO', 35000.00, 50, 10, NULL, NULL, true, now(), now()),
  ('44444444-4444-4444-4444-444444444408', 'Plato doble acero', 'Comedero bebedero', 'ACCESORIO', 42000.00, 25, 6, NULL, NULL, true, now(), now()),
  ('44444444-4444-4444-4444-444444444409', 'Shampoo antialérgico', 'Higiene perros sensibles', 'MEDICAMENTO', 28000.00, 40, 10, 'LOT-SHA-2025', '2026-11-10', true, now(), now()),
  ('44444444-4444-4444-4444-444444444410', 'Vitaminas B complex inyectable', 'Complejo B', 'MEDICAMENTO', 15500.00, 60, 12, 'LOT-VIT-25-C', '2027-05-30', true, now(), now());

COMMIT;

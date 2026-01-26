-- Este script corre automáticamente la primera vez que se levanta Postgres
CREATE DATABASE auth_db;
CREATE DATABASE hotel_db;
CREATE DATABASE booking_db; -- Para el servicio de Go
-- Agregar estas nuevas bases de datos para los microservicios existentes
CREATE DATABASE payment_db; -- Para el servicio de pagos (Go)
CREATE DATABASE wallet_db;  -- Para el servicio de billetera (Go)
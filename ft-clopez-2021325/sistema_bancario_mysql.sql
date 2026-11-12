-- =========================================================
-- SISTEMA BANCARIO
-- Motor: MySQL 8.0.16 o superior (necesario para que funcionen los CHECK)
-- =========================================================

drop database if exists sistema_bancario;
create database sistema_bancario;
use sistema_bancario;

-- ---------------------------------------------------------
-- tabla usuario (login y roles)
-- ---------------------------------------------------------
create table usuario (
    id_usuario int auto_increment primary key,
    nombre varchar(100) not null,
    username varchar(50) not null unique,
    password varchar(255) not null,
    rol varchar(20) not null default 'usuario',
    constraint ck_usuario_rol check (rol in ('admin', 'usuario'))
);

-- ---------------------------------------------------------
-- tabla cliente
-- ---------------------------------------------------------
create table cliente (
    id_cliente int auto_increment primary key,
    nombre varchar(50) not null,
    apellido varchar(50) not null,
    dpi varchar(13) not null unique,
    telefono varchar(8) not null,
    correo varchar(100) not null unique,
    estado varchar(10) not null default 'activo',
    constraint ck_cliente_estado check (estado in ('activo', 'inactivo')),
    constraint ck_cliente_dpi check (dpi regexp '^[0-9]{13}$'),
    constraint ck_cliente_telefono check (telefono regexp '^[0-9]{8}$')
);

-- ---------------------------------------------------------
-- tabla tipo_cuenta
-- ---------------------------------------------------------
create table tipo_cuenta (
    id_tipo int auto_increment primary key,
    nombre varchar(50) not null unique,
    descripcion varchar(255) not null
);

-- ---------------------------------------------------------
-- tabla sucursal
-- ---------------------------------------------------------
create table sucursal (
    id_sucursal int auto_increment primary key,
    nombre varchar(100) not null unique,
    direccion varchar(200) not null,
    telefono varchar(8) not null,
    constraint ck_sucursal_telefono check (telefono regexp '^[0-9]{8}$')
);

-- ---------------------------------------------------------
-- tabla empleado (cada empleado trabaja en una sucursal)
-- ---------------------------------------------------------
create table empleado (
    id_empleado int auto_increment primary key,
    nombre varchar(50) not null,
    apellido varchar(50) not null,
    puesto varchar(50) not null,
    telefono varchar(8) not null,
    id_sucursal int not null,
    constraint ck_empleado_telefono check (telefono regexp '^[0-9]{8}$'),
    constraint fk_empleado_sucursal foreign key (id_sucursal)
        references sucursal (id_sucursal)
);

-- ---------------------------------------------------------
-- tabla cuenta
-- un cliente puede tener varias cuentas
-- cada cuenta tiene un tipo y una sucursal
-- ---------------------------------------------------------
create table cuenta (
    id_cuenta int auto_increment primary key,
    numero_cuenta varchar(20) not null unique,
    saldo decimal(14, 2) not null default 0,
    fecha_apertura date not null default (curdate()),
    id_tipo int not null,
    id_cliente int not null,
    id_sucursal int not null,
    estado varchar(10) not null default 'activa',
    constraint ck_cuenta_estado check (estado in ('activa', 'inactiva')),
    constraint ck_cuenta_saldo check (saldo >= 0),
    constraint fk_cuenta_tipo foreign key (id_tipo)
        references tipo_cuenta (id_tipo),
    constraint fk_cuenta_cliente foreign key (id_cliente)
        references cliente (id_cliente),
    constraint fk_cuenta_sucursal foreign key (id_sucursal)
        references sucursal (id_sucursal)
);

-- ---------------------------------------------------------
-- tabla movimiento (depositos, retiros y transferencias)
-- id_cuenta = cuenta principal (el origen si es transferencia)
-- id_cuenta_destino = solo se usa en transferencias
-- ---------------------------------------------------------
create table movimiento (
    id_movimiento int auto_increment primary key,
    tipo varchar(15) not null,
    monto decimal(14, 2) not null,
    fecha timestamp not null default current_timestamp,
    descripcion varchar(150),
    id_cuenta int not null,
    id_cuenta_destino int,
    id_usuario int,
    constraint ck_mov_tipo check (tipo in ('deposito', 'retiro', 'transferencia')),
    constraint ck_mov_monto check (monto > 0),
    constraint ck_mov_destino check (
        (tipo = 'transferencia' and id_cuenta_destino is not null and id_cuenta_destino <> id_cuenta)
        or (tipo <> 'transferencia' and id_cuenta_destino is null)
    ),
    constraint fk_mov_cuenta foreign key (id_cuenta)
        references cuenta (id_cuenta),
    constraint fk_mov_destino foreign key (id_cuenta_destino)
        references cuenta (id_cuenta),
    constraint fk_mov_usuario foreign key (id_usuario)
        references usuario (id_usuario) on delete set null
);

-- ---------------------------------------------------------
-- tabla transferencia (detalle de cada transferencia)
-- ---------------------------------------------------------
create table transferencia (
    id_transferencia int auto_increment primary key,
    id_cuenta_origen int not null,
    id_cuenta_destino int not null,
    monto decimal(14, 2) not null,
    fecha timestamp not null default current_timestamp,
    id_movimiento int not null unique,
    constraint ck_transf_monto check (monto > 0),
    constraint ck_transf_distintas check (id_cuenta_origen <> id_cuenta_destino),
    constraint fk_transf_origen foreign key (id_cuenta_origen)
        references cuenta (id_cuenta),
    constraint fk_transf_destino foreign key (id_cuenta_destino)
        references cuenta (id_cuenta),
    constraint fk_transf_movimiento foreign key (id_movimiento)
        references movimiento (id_movimiento) on delete cascade
);

-- ---------------------------------------------------------
-- indices
-- ---------------------------------------------------------
create index ix_mov_cuenta on movimiento (id_cuenta);
create index ix_mov_destino on movimiento (id_cuenta_destino);
create index ix_mov_fecha on movimiento (fecha);
create index ix_cuenta_cliente on cuenta (id_cliente);
create index ix_cuenta_tipo on cuenta (id_tipo);
create index ix_cuenta_sucursal on cuenta (id_sucursal);
create index ix_empleado_sucursal on empleado (id_sucursal);

-- ---------------------------------------------------------
-- vista: resumen de operaciones por tipo
-- ---------------------------------------------------------
create or replace view vw_resumen_operaciones as
select tipo,
       count(*) as cantidad,
       sum(monto) as total_monto,
       round(avg(monto), 2) as promedio_monto,
       min(fecha) as primera_operacion,
       max(fecha) as ultima_operacion
from movimiento
group by tipo;

-- =========================================================
-- datos de prueba
-- =========================================================

-- contrasenas: admin -> admin123 | usuario -> usuario123
insert into usuario (nombre, username, password, rol) values
('Administrador General', 'admin', '$2b$10$qQtusSYCCx1fHuVnPMyZ7u4fEZU7Z9DraxM575w8A9iE5I/BN6.q6', 'admin'),
('Usuario de Consulta', 'usuario', '$2b$10$FLTvkAf7x3us4apDbKmM8.TGrcNR2VyTIl.tTcYGQzl7mshVX4pG2', 'usuario');

insert into tipo_cuenta (nombre, descripcion) values
('Monetaria', 'Cuenta para manejo de cheques y pagos frecuentes'),
('Ahorro', 'Cuenta que genera intereses sobre el saldo disponible'),
('Plazo fijo', 'Deposito a un plazo determinado con tasa preferencial');

insert into sucursal (nombre, direccion, telefono) values
('Agencia Central', '7a. avenida 10-25, zona 1, Guatemala', '22334455'),
('Agencia Miraflores', 'Calzada Roosevelt 22-43, zona 11, Guatemala', '24456677'),
('Agencia Mixco', 'Calzada San Juan 15-20, zona 4 de Mixco', '24789900');

insert into cliente (nombre, apellido, dpi, telefono, correo) values
('Carlos', 'Lopez', '2456789010101', '55123456', 'carlos.lopez@correo.com'),
('Maria', 'Hernandez', '3012456780101', '44789012', 'maria.hernandez@correo.com'),
('Jose', 'Garcia', '1987654320108', '33456789', 'jose.garcia@correo.com'),
('Ana', 'Morales', '2765432100115', '57894561', 'ana.morales@correo.com');

insert into empleado (nombre, apellido, puesto, telefono, id_sucursal) values
('Luis', 'Ramirez', 'Gerente', '55667788', 1),
('Sofia', 'Castillo', 'Cajero', '44556677', 1),
('Pedro', 'Mendez', 'Asesor de cuentas', '33221144', 2),
('Lucia', 'Ortiz', 'Cajero', '52341234', 3);

insert into cuenta (numero_cuenta, saldo, fecha_apertura, id_tipo, id_cliente, id_sucursal) values
('1001-0001-01', 15250.75, '2024-02-15', 1, 1, 1),
('1002-0001-02', 8000.00, '2024-05-03', 2, 1, 2),
('1002-0002-01', 32500.50, '2023-11-20', 2, 2, 1),
('1003-0003-01', 50000.00, '2025-01-10', 3, 3, 3),
('1001-0004-01', 1200.00, '2025-06-28', 1, 4, 2);

-- =========================================================
-- consultas de verificacion
-- =========================================================
-- select * from cliente;

-- select c.numero_cuenta, c.saldo,
--        concat(cl.nombre, ' ', cl.apellido) as cliente,
--        t.nombre as tipo, s.nombre as sucursal
-- from cuenta c
-- inner join cliente cl on cl.id_cliente = c.id_cliente
-- inner join tipo_cuenta t on t.id_tipo = c.id_tipo
-- inner join sucursal s on s.id_sucursal = c.id_sucursal;

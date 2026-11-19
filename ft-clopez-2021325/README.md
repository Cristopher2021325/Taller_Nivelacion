# Sistema Bancario — Angular, TypeScript y JWT

Aplicación web para administrar **clientes, cuentas, tipos de cuenta, sucursales y empleados** de un banco.
El frontend está desarrollado en **Angular + TypeScript + Bootstrap** y consume una **API REST** construida con
**Node.js + Express + TypeScript**, con autenticación y autorización por roles mediante **JWT** y base de datos **MySQL**.

## Estructura del proyecto

```
sistema-bancario/
├── backend/                 API REST (Node.js + Express + TypeScript)
│   └── src/
│       ├── config/          conexión a MySQL y variables de entorno
│       ├── models/          interfaces de las entidades
│       ├── services/        consultas a la base de datos (lógica de negocio)
│       ├── controllers/     manejo de peticiones y respuestas
│       ├── routes/          definición de endpoints
│       ├── middleware/      verificación de JWT, roles, validaciones y errores
│       └── utils/
├── frontend/                aplicación Angular
│   └── src/app/
│       ├── core/            modelos, servicios HTTP, interceptor y guards
│       ├── shared/          navbar, notificaciones, confirmación, validadores
│       ├── layout/          plantilla principal con menú
│       └── pages/           login, inicio y CRUD de cada entidad
├── sistema_bancario_mysql.sql      script de creación de la base de datos y datos de prueba
├── postman/                 colección de pruebas de la API
└── docs/
    ├── diagrama-er.png      diagrama entidad-relación
    └── evidencias/          capturas de funcionamiento y resultado de pruebas en Postman
```

## Modelo de datos

| Entidad      | Clave primaria | Claves foráneas                         |
|--------------|----------------|-----------------------------------------|
| cliente      | id_cliente     | —                                       |
| tipo_cuenta  | id_tipo        | —                                       |
| sucursal     | id_sucursal    | —                                       |
| cuenta       | id_cuenta      | id_tipo, id_cliente, id_sucursal        |
| empleado     | id_empleado    | id_sucursal                             |

Relaciones:

1. Un cliente puede tener varias cuentas (1:N).
2. Una cuenta pertenece a un tipo de cuenta (N:1).
3. Una sucursal administra varias cuentas (1:N).
4. Un empleado trabaja en una sucursal (N:1).

La tabla `usuario` se utiliza únicamente para el inicio de sesión y los roles.

## Requisitos

- Node.js 20.19 o superior (recomendado 22 LTS)
- MySQL 8.0.16 o superior (necesario para los `CHECK`)
- Angular CLI 21 (opcional, se puede usar `npx`)

## Instalación y ejecución

### 1. Base de datos

```bash
mysql -u root -p < sistema_bancario_mysql.sql
```

El script crea la base `sistema_bancario`, las tablas, la vista de reporte y los datos de prueba. También se puede abrir en MySQL Workbench y ejecutarlo completo.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # en Windows: copy .env.example .env
npm run dev
```

La API queda disponible en `http://localhost:3000/api`.
Si el usuario o la contraseña de MySQL son distintos de `root` / `admin`, se deben cambiar `DB_USER` y `DB_PASSWORD` en el archivo `.env`.

Para compilar a JavaScript: `npm run build` y luego `npm start`.

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Abrir `http://localhost:4200`.

## Usuarios de prueba

| Rol           | Usuario   | Contraseña  | Permisos                                      |
|---------------|-----------|-------------|-----------------------------------------------|
| Administrador | `admin`   | `admin123`  | Listar, consultar, registrar, editar, eliminar |
| Usuario       | `usuario` | `usuario123`| Solo listar y consultar                        |

## Endpoints de la API

Todas las rutas, excepto `POST /api/auth/login`, requieren el encabezado `Authorization: Bearer <token>`.

| Método | Ruta                          | Rol          | Descripción                     |
|--------|-------------------------------|--------------|---------------------------------|
| POST   | /api/auth/login               | público      | Inicia sesión y devuelve el JWT |
| GET    | /api/auth/perfil              | autenticado  | Datos del usuario del token     |
| GET    | /api/clientes                 | autenticado  | Listar clientes                 |
| GET    | /api/clientes/:id             | autenticado  | Obtener cliente por id          |
| GET    | /api/clientes/:id/cuentas     | autenticado  | Cuentas de un cliente           |
| POST   | /api/clientes                 | admin        | Registrar cliente               |
| PUT    | /api/clientes/:id             | admin        | Actualizar cliente              |
| DELETE | /api/clientes/:id             | admin        | Eliminar cliente                |

Las rutas `/api/cuentas`, `/api/tipos-cuenta`, `/api/sucursales` y `/api/empleados` siguen el mismo esquema
(GET, GET por id, POST, PUT y DELETE).

### Respuestas de error

| Código | Caso                                                         |
|--------|--------------------------------------------------------------|
| 400    | Datos inválidos (incluye la lista `errores` por campo)       |
| 401    | Credenciales incorrectas, token faltante, inválido o expirado (`TOKEN_EXPIRADO`) |
| 403    | El usuario no tiene permisos para la operación               |
| 404    | Registro o ruta no encontrada                                |
| 409    | Registro duplicado o con datos relacionados                  |
| 500    | Error interno del servidor o de conexión con la base de datos |

## Seguridad implementada

- **Backend:** el login compara la contraseña con `bcrypt` y genera un JWT con vigencia de 1 hora.
  El middleware `verificarToken` valida el token en cada ruta protegida y `permitirRoles` restringe
  las operaciones de registro, edición y eliminación al rol administrador.
- **Frontend:** el token se guarda en `localStorage` al iniciar sesión. El interceptor `authInterceptor`
  lo agrega automáticamente a cada petición y muestra mensajes cuando el token expiró, no hay permisos
  o hay un error del servidor. Los guards `authGuard` y `adminGuard` protegen las rutas, y la opción
  **Cerrar sesión** elimina el token almacenado.

## Validaciones

Se validan en los formularios de Angular y nuevamente en la API (`express-validator`):

- Campos obligatorios y longitud mínima / máxima.
- Nombres y apellidos solo con letras.
- DPI de 13 dígitos y teléfono de 8 dígitos.
- Formato de correo electrónico.
- Número de cuenta con formato `0000-0000-00`.
- Saldo numérico mayor o igual a 0.
- Fecha de apertura válida y no posterior a la fecha actual.

## Pruebas en Postman

1. Importar `postman/sistema-bancario.postman_collection.json` en Postman.
2. Ejecutar primero la carpeta **1. Autenticación** (guarda los tokens en variables de la colección).
3. Ejecutar el resto de carpetas, o toda la colección con *Run collection*.

La colección incluye 80 peticiones con pruebas automáticas (login correcto e incorrecto, token faltante,
inválido y expirado, permisos por rol, CRUD completo de las 5 entidades, validaciones, integridad referencial y la carpeta 9 de operaciones bancarias con las pruebas P005 a P010).
El resultado de la ejecución se encuentra en `docs/evidencias/pruebas-postman.txt`.

## Operaciones bancarias (API)

Todas requieren token (`Authorization: Bearer <token>`). Las de escritura solo las puede usar el rol `admin`.

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| POST | `/api/depositos` | Depósito. Body: `{ id_cuenta, monto, descripcion? }` |
| POST | `/api/retiros` | Retiro (valida saldo disponible). Mismo body |
| POST | `/api/transferencias` | Transferencia. Body: `{ id_cuenta_origen, id_cuenta_destino, monto, descripcion? }` |
| POST | `/api/movimientos` | Registra depósito, retiro o transferencia según `tipo` |
| GET | `/api/movimientos?tipo=&desde=&hasta=` | Historial con filtros opcionales (`yyyy-mm-dd`) |
| GET | `/api/movimientos/cuenta/:idCuenta` | Movimientos de una cuenta (como origen o destino) |
| GET | `/api/reportes/resumen` | Reporte: totales y resumen de operaciones por tipo |
| GET | `/api/clientes?q=` / `/api/cuentas?q=` | Búsqueda por nombre, DPI, correo o número de cuenta |
| DELETE | `/api/clientes/:id` | Desactivación lógica (cliente y sus cuentas quedan inactivos) |
| PATCH | `/api/clientes/:id/reactivar` | Reactiva un cliente |

Reglas aplicadas: monto mayor a cero, saldo suficiente, no transferir a la misma cuenta, cuenta inactiva no opera,
cada operación se guarda en `movimiento` (y `transferencia`) dentro de una transacción SQL.

### Pruebas obligatorias verificadas contra MySQL

P005 depósito, P006 retiro, P007 retiro mayor al saldo (422), P008 transferencia, P009 misma cuenta (400),
P010 cuenta inactiva (409). Evidencia: `docs/evidencias/pruebas-postman.txt` (80 peticiones, 122 verificaciones, 0 fallos).

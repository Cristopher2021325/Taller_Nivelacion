import { body } from 'express-validator';
import { validarCampos } from './validar.middleware';

const texto = (campo: string, etiqueta: string, min: number, max: number) =>
  body(campo)
    .notEmpty().withMessage(`${etiqueta} es obligatorio`).bail()
    .isString().withMessage(`${etiqueta} debe ser texto`).bail()
    .trim()
    .isLength({ min, max }).withMessage(`${etiqueta} debe tener entre ${min} y ${max} caracteres`);

const soloLetras = (campo: string, etiqueta: string) =>
  texto(campo, etiqueta, 2, 50)
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/).withMessage(`${etiqueta} solo puede contener letras`);

const telefono = () =>
  body('telefono')
    .notEmpty().withMessage('El teléfono es obligatorio').bail()
    .isString().withMessage('El teléfono debe ser texto').bail()
    .trim()
    .matches(/^[0-9]{8}$/).withMessage('El teléfono debe tener 8 dígitos');

const idForaneo = (campo: string, etiqueta: string) =>
  body(campo)
    .notEmpty().withMessage(`${etiqueta} es obligatorio`).bail()
    .isInt({ min: 1 }).withMessage(`${etiqueta} no es válido`)
    .toInt();

export const validarLogin = [
  body('username').notEmpty().withMessage('El usuario es obligatorio').bail().isString().trim(),
  body('password').notEmpty().withMessage('La contraseña es obligatoria').bail().isString(),
  validarCampos,
];

export const validarCliente = [
  soloLetras('nombre', 'El nombre'),
  soloLetras('apellido', 'El apellido'),
  body('dpi')
    .notEmpty().withMessage('El DPI es obligatorio').bail()
    .isString().withMessage('El DPI debe ser texto').bail()
    .trim()
    .matches(/^[0-9]{13}$/).withMessage('El DPI debe tener exactamente 13 dígitos'),
  telefono(),
  body('correo')
    .notEmpty().withMessage('El correo es obligatorio').bail()
    .trim()
    .isEmail().withMessage('El correo no tiene un formato válido')
    .isLength({ max: 100 }).withMessage('El correo no puede superar 100 caracteres')
    .normalizeEmail({ gmail_remove_dots: false }),
  validarCampos,
];

export const validarTipoCuenta = [
  texto('nombre', 'El nombre', 3, 50),
  texto('descripcion', 'La descripción', 5, 255),
  validarCampos,
];

export const validarSucursal = [
  texto('nombre', 'El nombre', 3, 100),
  texto('direccion', 'La dirección', 5, 200),
  telefono(),
  validarCampos,
];

export const validarEmpleado = [
  soloLetras('nombre', 'El nombre'),
  soloLetras('apellido', 'El apellido'),
  texto('puesto', 'El puesto', 3, 50),
  telefono(),
  idForaneo('id_sucursal', 'La sucursal'),
  body('estado').optional().isIn(['activa', 'inactiva']).withMessage('El estado debe ser activa o inactiva'),
  validarCampos,
];

export const validarCuenta = [
  body('numero_cuenta')
    .notEmpty().withMessage('El número de cuenta es obligatorio').bail()
    .isString().withMessage('El número de cuenta debe ser texto').bail()
    .trim()
    .matches(/^[0-9]{4}-[0-9]{4}-[0-9]{2}$/).withMessage('El número de cuenta debe tener el formato 0000-0000-00'),
  body('saldo')
    .notEmpty().withMessage('El saldo es obligatorio').bail()
    .isFloat({ min: 0 }).withMessage('El saldo debe ser un número mayor o igual a 0')
    .toFloat(),
  body('fecha_apertura')
    .notEmpty().withMessage('La fecha de apertura es obligatoria').bail()
    .isISO8601({ strict: true }).withMessage('La fecha de apertura no es válida (yyyy-mm-dd)').bail()
    .custom((valor: string) => new Date(valor) <= new Date()).withMessage('La fecha de apertura no puede ser futura'),
  idForaneo('id_tipo', 'El tipo de cuenta'),
  idForaneo('id_cliente', 'El cliente'),
  idForaneo('id_sucursal', 'La sucursal'),
  validarCampos,
];

export const validarOperacion = [
  idForaneo('id_cuenta', 'La cuenta'),
  body('monto')
    .notEmpty().withMessage('El monto es obligatorio').bail()
    .isFloat({ gt: 0 }).withMessage('El monto debe ser mayor que cero').bail()
    .matches(/^\d+(\.\d{1,2})?$/).withMessage('El monto admite máximo 2 decimales')
    .toFloat(),
  body('descripcion')
    .optional({ checkFalsy: true })
    .isString().withMessage('La descripción debe ser texto')
    .trim()
    .isLength({ max: 150 }).withMessage('La descripción no puede exceder 150 caracteres'),
  validarCampos,
];

const montoPositivo = () =>
  body('monto')
    .notEmpty().withMessage('El monto es obligatorio').bail()
    .isFloat({ gt: 0 }).withMessage('El monto debe ser mayor que cero').bail()
    .matches(/^\d+(\.\d{1,2})?$/).withMessage('El monto admite máximo 2 decimales')
    .toFloat();

const descripcionOpcional = () =>
  body('descripcion')
    .optional({ checkFalsy: true })
    .isString().withMessage('La descripción debe ser texto')
    .trim()
    .isLength({ max: 150 }).withMessage('La descripción no puede exceder 150 caracteres');

export const validarTransferencia = [
  idForaneo('id_cuenta_origen', 'La cuenta origen'),
  idForaneo('id_cuenta_destino', 'La cuenta destino'),
  body('id_cuenta_destino')
    .custom((valor, { req }) => Number(valor) !== Number((req as any).body.id_cuenta_origen))
    .withMessage('No se puede transferir hacia la misma cuenta'),
  montoPositivo(),
  descripcionOpcional(),
  validarCampos,
];

export const validarMovimiento = [
  body('tipo').isIn(['deposito', 'retiro', 'transferencia']).withMessage('El tipo debe ser deposito, retiro o transferencia'),
  body('tipo').custom((tipo, { req }) => {
    if (tipo === 'transferencia') return (req as any).body.id_cuenta_origen && (req as any).body.id_cuenta_destino;
    return (req as any).body.id_cuenta;
  }).withMessage('Faltan las cuentas de la operación'),
  montoPositivo(),
  descripcionOpcional(),
  validarCampos,
];
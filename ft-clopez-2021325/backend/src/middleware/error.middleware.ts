import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/http-error';

interface ErrorBaseDatos {
  code?: string;
  type?: string;
}

export const rutaNoEncontrada = (req: Request, res: Response) => {
  res.status(404).json({
    mensaje: `La ruta ${req.method} ${req.originalUrl} no existe`,
    codigo: 'RUTA_NO_ENCONTRADA',
  });
};

export const manejarErrores = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ mensaje: err.message, codigo: err.codigo });
  }

  const error = err as ErrorBaseDatos;

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El cuerpo de la petición no es un JSON válido', codigo: 'JSON_INVALIDO' });
  }

  switch (error.code) {
    case 'ER_DUP_ENTRY':
      return res.status(409).json({
        mensaje: 'Ya existe un registro con ese valor único (DPI, correo, número de cuenta o nombre)',
        codigo: 'DUPLICADO',
      });
    case 'ER_ROW_IS_REFERENCED':
    case 'ER_ROW_IS_REFERENCED_2':
      return res.status(409).json({
        mensaje: 'No se puede eliminar: el registro tiene otros datos relacionados',
        codigo: 'REGISTRO_RELACIONADO',
      });
    case 'ER_NO_REFERENCED_ROW':
    case 'ER_NO_REFERENCED_ROW_2':
      return res.status(400).json({
        mensaje: 'El registro relacionado (cliente, tipo de cuenta o sucursal) no existe',
        codigo: 'REFERENCIA_INEXISTENTE',
      });
    case 'ER_CHECK_CONSTRAINT_VIOLATED':
    case 'ER_BAD_NULL_ERROR':
    case 'ER_DATA_TOO_LONG':
    case 'ER_TRUNCATED_WRONG_VALUE':
    case 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD':
    case 'ER_WARN_DATA_OUT_OF_RANGE':
    case 'ER_DATA_OUT_OF_RANGE':
      return res.status(400).json({ mensaje: 'Uno de los valores enviados no es válido', codigo: 'DATO_INVALIDO' });
    case 'ECONNREFUSED':
    case 'PROTOCOL_CONNECTION_LOST':
    case 'ER_ACCESS_DENIED_ERROR':
    case 'ER_BAD_DB_ERROR':
      console.error(err);
      return res.status(500).json({ mensaje: 'No fue posible conectar con la base de datos', codigo: 'ERROR_BD' });
  }

  console.error(err);
  res.status(500).json({ mensaje: 'Ocurrió un error interno en el servidor', codigo: 'ERROR_SERVIDOR' });
};

import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/http-error';

interface ErrorPostgres {
  code?: string;
  detail?: string;
  type?: string;
}

export const rutaNoEncontrada = (req: Request, res: Response) => {
  res.status(404).json({
    mensaje: `La ruta ${req.method} ${req.originalUrl} no existe`,
    codigo: 'RUTA_NO_ENCONTRADA',
  });
};

// manejador central de errores
export const manejarErrores = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ mensaje: err.message, codigo: err.codigo });
  }

  const error = err as ErrorPostgres;

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El cuerpo de la petición no es un JSON válido', codigo: 'JSON_INVALIDO' });
  }

  switch (error.code) {
    case '23505':
      return res.status(409).json({
        mensaje: 'Ya existe un registro con ese valor único (DPI, correo, número de cuenta o nombre)',
        codigo: 'DUPLICADO',
      });
    case '23503':
      if (error.detail?.includes('is still referenced')) {
        return res.status(409).json({
          mensaje: 'No se puede eliminar: el registro tiene otros datos relacionados',
          codigo: 'REGISTRO_RELACIONADO',
        });
      }
      return res.status(400).json({
        mensaje: 'El registro relacionado (cliente, tipo de cuenta o sucursal) no existe',
        codigo: 'REFERENCIA_INEXISTENTE',
      });
    case '23514':
    case '22P02':
    case '22003':
      return res.status(400).json({ mensaje: 'Uno de los valores enviados no es válido', codigo: 'DATO_INVALIDO' });
    case 'ECONNREFUSED':
    case '57P01':
    case '57P03':
    case '3D000':
    case '28P01':
      console.error(err);
      return res.status(500).json({ mensaje: 'No fue posible conectar con la base de datos', codigo: 'ERROR_BD' });
  }

  console.error(err);
  res.status(500).json({ mensaje: 'Ocurrió un error interno en el servidor', codigo: 'ERROR_SERVIDOR' });
};

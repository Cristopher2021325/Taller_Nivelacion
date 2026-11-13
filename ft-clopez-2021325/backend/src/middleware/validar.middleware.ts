import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

export const validarCampos = (req: Request, res: Response, next: NextFunction) => {
  const resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    const errores = resultado.array({ onlyFirstError: true }).map((e: any) => ({
      campo: e.type === 'field' ? e.path : e.type,
      mensaje: e.msg,
    }));
    return res.status(400).json({
      mensaje: 'Los datos enviados no son válidos',
      codigo: 'VALIDACION',
      errores,
    });
  }
  next();
};

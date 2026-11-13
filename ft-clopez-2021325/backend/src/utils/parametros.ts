import { Request } from 'express';
import { HttpError } from './http-error';

export const obtenerId = (req: Request, nombre = 'id'): number => {
  const id = Number(req.params[nombre]);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, 'El id enviado no es válido', 'ID_INVALIDO');
  }
  return id;
};

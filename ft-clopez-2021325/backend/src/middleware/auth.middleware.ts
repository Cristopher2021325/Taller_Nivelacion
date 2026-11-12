import { NextFunction, Request, Response } from 'express';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { env } from '../config/env';
import { UsuarioToken } from '../models/usuario.model';

export const verificarToken = (req: Request, res: Response, next: NextFunction) => {
  const encabezado = req.headers.authorization;

  if (!encabezado || !encabezado.startsWith('Bearer ')) {
    return res.status(401).json({
      mensaje: 'Debe iniciar sesión para acceder a este recurso',
      codigo: 'TOKEN_REQUERIDO',
    });
  }

  const token = encabezado.substring(7);

  try {
    const datos = jwt.verify(token, env.jwt.secret) as UsuarioToken;
    req.usuario = {
      id_usuario: datos.id_usuario,
      nombre: datos.nombre,
      username: datos.username,
      rol: datos.rol,
    };
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({
        mensaje: 'Su sesión ha expirado, inicie sesión nuevamente',
        codigo: 'TOKEN_EXPIRADO',
      });
    }
    if (error instanceof JsonWebTokenError) {
      return res.status(401).json({
        mensaje: 'El token enviado no es válido',
        codigo: 'TOKEN_INVALIDO',
      });
    }
    next(error);
  }
};

import { NextFunction, Request, Response } from 'express';
import { Rol } from '../models/usuario.model';


export const permitirRoles = (...roles: Rol[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        mensaje: 'No tiene permisos para realizar esta operación',
        codigo: 'SIN_PERMISOS',
      });
    }
    next();
  };
};

export const soloAdmin = permitirRoles('admin');

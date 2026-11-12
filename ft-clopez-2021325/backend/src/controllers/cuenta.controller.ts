import { Request, Response } from 'express';
import * as cuentaService from '../services/cuenta.service';
import { obtenerId } from '../utils/parametros';

export const listar = async (req: Request, res: Response) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : undefined;
  const data = await cuentaService.obtenerTodos(q || undefined);
  res.json(data);
};

export const obtener = async (req: Request, res: Response) => {
  const data = await cuentaService.obtenerPorId(obtenerId(req));
  res.json(data);
};

export const crear = async (req: Request, res: Response) => {
  const data = await cuentaService.crear(req.body);
  res.status(201).json({ mensaje: 'Cuenta registrada correctamente', data });
};

export const actualizar = async (req: Request, res: Response) => {
  const data = await cuentaService.actualizar(obtenerId(req), req.body);
  res.json({ mensaje: 'Cuenta actualizada correctamente', data });
};

export const eliminar = async (req: Request, res: Response) => {
  await cuentaService.eliminar(obtenerId(req));
  res.json({ mensaje: 'Cuenta eliminada correctamente' });
};

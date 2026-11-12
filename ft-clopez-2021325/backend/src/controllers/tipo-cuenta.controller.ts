import { Request, Response } from 'express';
import * as tipoCuentaService from '../services/tipo-cuenta.service';
import { obtenerId } from '../utils/parametros';

export const listar = async (_req: Request, res: Response) => {
  const data = await tipoCuentaService.obtenerTodos();
  res.json(data);
};

export const obtener = async (req: Request, res: Response) => {
  const data = await tipoCuentaService.obtenerPorId(obtenerId(req));
  res.json(data);
};

export const crear = async (req: Request, res: Response) => {
  const data = await tipoCuentaService.crear(req.body);
  res.status(201).json({ mensaje: 'Tipo de cuenta registrado correctamente', data });
};

export const actualizar = async (req: Request, res: Response) => {
  const data = await tipoCuentaService.actualizar(obtenerId(req), req.body);
  res.json({ mensaje: 'Tipo de cuenta actualizado correctamente', data });
};

export const eliminar = async (req: Request, res: Response) => {
  await tipoCuentaService.eliminar(obtenerId(req));
  res.json({ mensaje: 'Tipo de cuenta eliminado correctamente' });
};

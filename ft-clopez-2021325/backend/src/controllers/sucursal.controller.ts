import { Request, Response } from 'express';
import * as sucursalService from '../services/sucursal.service';
import { obtenerId } from '../utils/parametros';

export const listar = async (_req: Request, res: Response) => {
  const data = await sucursalService.obtenerTodos();
  res.json(data);
};

export const obtener = async (req: Request, res: Response) => {
  const data = await sucursalService.obtenerPorId(obtenerId(req));
  res.json(data);
};

export const crear = async (req: Request, res: Response) => {
  const data = await sucursalService.crear(req.body);
  res.status(201).json({ mensaje: 'Sucursal registrada correctamente', data });
};

export const actualizar = async (req: Request, res: Response) => {
  const data = await sucursalService.actualizar(obtenerId(req), req.body);
  res.json({ mensaje: 'Sucursal actualizada correctamente', data });
};

export const eliminar = async (req: Request, res: Response) => {
  await sucursalService.eliminar(obtenerId(req));
  res.json({ mensaje: 'Sucursal eliminada correctamente' });
};

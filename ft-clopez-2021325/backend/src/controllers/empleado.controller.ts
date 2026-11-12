import { Request, Response } from 'express';
import * as empleadoService from '../services/empleado.service';
import { obtenerId } from '../utils/parametros';

export const listar = async (_req: Request, res: Response) => {
  const data = await empleadoService.obtenerTodos();
  res.json(data);
};

export const obtener = async (req: Request, res: Response) => {
  const data = await empleadoService.obtenerPorId(obtenerId(req));
  res.json(data);
};

export const crear = async (req: Request, res: Response) => {
  const data = await empleadoService.crear(req.body);
  res.status(201).json({ mensaje: 'Empleado registrado correctamente', data });
};

export const actualizar = async (req: Request, res: Response) => {
  const data = await empleadoService.actualizar(obtenerId(req), req.body);
  res.json({ mensaje: 'Empleado actualizado correctamente', data });
};

export const eliminar = async (req: Request, res: Response) => {
  await empleadoService.eliminar(obtenerId(req));
  res.json({ mensaje: 'Empleado eliminado correctamente' });
};

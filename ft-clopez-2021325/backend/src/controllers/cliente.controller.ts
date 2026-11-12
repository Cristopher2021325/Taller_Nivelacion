import { Request, Response } from 'express';
import * as clienteService from '../services/cliente.service';
import * as cuentaService from '../services/cuenta.service';
import { obtenerId } from '../utils/parametros';

export const listar = async (req: Request, res: Response) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : undefined;
  const data = await clienteService.obtenerTodos(q || undefined);
  res.json(data);
};

export const obtener = async (req: Request, res: Response) => {
  const data = await clienteService.obtenerPorId(obtenerId(req));
  res.json(data);
};

export const listarCuentas = async (req: Request, res: Response) => {
  const id = obtenerId(req);
  await clienteService.obtenerPorId(id);
  const data = await cuentaService.obtenerPorCliente(id);
  res.json(data);
};

export const crear = async (req: Request, res: Response) => {
  const data = await clienteService.crear(req.body);
  res.status(201).json({ mensaje: 'Cliente registrado correctamente', data });
};

export const actualizar = async (req: Request, res: Response) => {
  const data = await clienteService.actualizar(obtenerId(req), req.body);
  res.json({ mensaje: 'Cliente actualizado correctamente', data });
};

export const eliminar = async (req: Request, res: Response) => {
  await clienteService.eliminar(obtenerId(req));
  res.json({ mensaje: 'Cliente desactivado correctamente' });
};

export const reactivar = async (req: Request, res: Response) => {
  const data = await clienteService.reactivar(obtenerId(req));
  res.json({ mensaje: 'Cliente reactivado correctamente', data });
};

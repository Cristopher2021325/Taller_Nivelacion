import { Request, Response } from 'express';
import * as operacionService from '../services/operacion.service';

export const depositar = async (req: Request, res: Response) => {
  const data = await operacionService.depositar(req.body, req.usuario?.id_usuario ?? null);
  res.status(201).json({ mensaje: 'Depósito registrado correctamente', data });
};

export const retirar = async (req: Request, res: Response) => {
  const data = await operacionService.retirar(req.body, req.usuario?.id_usuario ?? null);
  res.status(201).json({ mensaje: 'Retiro registrado correctamente', data });
};

export const transferir = async (req: Request, res: Response) => {
  const data = await operacionService.transferir(req.body, req.usuario?.id_usuario ?? null);
  res.status(201).json({ mensaje: 'Transferencia realizada correctamente', data });
};

// POST /movimientos: registra deposito, retiro o transferencia segun el campo "tipo"
export const registrarMovimiento = async (req: Request, res: Response) => {
  const idUsuario = req.usuario?.id_usuario ?? null;
  const { tipo } = req.body;
  if (tipo === 'deposito') return res.status(201).json({ mensaje: 'Depósito registrado correctamente', data: await operacionService.depositar(req.body, idUsuario) });
  if (tipo === 'retiro') return res.status(201).json({ mensaje: 'Retiro registrado correctamente', data: await operacionService.retirar(req.body, idUsuario) });
  return res.status(201).json({ mensaje: 'Transferencia realizada correctamente', data: await operacionService.transferir(req.body, idUsuario) });
};

import { Request, Response } from 'express';
import * as movimientoService from '../services/movimiento.service';
import { obtenerId } from '../utils/parametros';

const texto = (valor: unknown) => (typeof valor === 'string' && valor.trim() ? valor.trim() : undefined);

export const listar = async (req: Request, res: Response) => {
  res.json(
    await movimientoService.obtenerTodos({
      tipo: texto(req.query.tipo),
      desde: texto(req.query.desde),
      hasta: texto(req.query.hasta),
    })
  );
};

export const listarPorCuenta = async (req: Request, res: Response) => {
  res.json(await movimientoService.obtenerPorCuenta(obtenerId(req, 'idCuenta')));
};

export const resumen = async (_req: Request, res: Response) => {
  res.json(await movimientoService.resumen());
};

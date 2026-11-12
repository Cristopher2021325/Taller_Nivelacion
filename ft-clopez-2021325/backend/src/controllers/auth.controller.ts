import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const resultado = await authService.login(username, password);
  res.json({ mensaje: 'Inicio de sesión exitoso', ...resultado });
};

export const perfil = async (req: Request, res: Response) => {
  res.json({ usuario: req.usuario });
};

import { UsuarioToken } from '../models/usuario.model';

declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioToken;
    }
  }
}

export {};

import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { pool } from '../config/db';
import { env } from '../config/env';
import { Usuario, UsuarioToken } from '../models/usuario.model';
import { HttpError } from '../utils/http-error';

export const login = async (username: string, password: string) => {
  const { rows } = await pool.query<Usuario>(
    'select id_usuario, nombre, username, password, rol from usuario where username = $1',
    [username]
  );

  const usuario = rows[0];
  const passwordValido = usuario ? await bcrypt.compare(password, usuario.password) : false;

  if (!usuario || !passwordValido) {
    throw new HttpError(401, 'Usuario o contraseña incorrectos', 'CREDENCIALES_INVALIDAS');
  }

  const datos: UsuarioToken = {
    id_usuario: usuario.id_usuario,
    nombre: usuario.nombre,
    username: usuario.username,
    rol: usuario.rol,
  };

  const token = jwt.sign(datos, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn as SignOptions['expiresIn'],
  });

  return { token, usuario: datos };
};

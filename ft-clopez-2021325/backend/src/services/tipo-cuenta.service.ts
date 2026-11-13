import { pool } from '../config/db';
import { TipoCuenta } from '../models/tipo-cuenta.model';
import { noEncontrado } from '../utils/http-error';

export const obtenerTodos = async (): Promise<TipoCuenta[]> => {
  const { rows } = await pool.query<TipoCuenta>(
    'select id_tipo, nombre, descripcion from tipo_cuenta order by id_tipo'
  );
  return rows;
};

export const obtenerPorId = async (id: number): Promise<TipoCuenta> => {
  const { rows } = await pool.query<TipoCuenta>(
    'select id_tipo, nombre, descripcion from tipo_cuenta where id_tipo = $1',
    [id]
  );
  if (!rows[0]) throw noEncontrado('Tipo de cuenta');
  return rows[0];
};

export const crear = async (t: TipoCuenta): Promise<TipoCuenta> => {
  const { rows } = await pool.query<TipoCuenta>(
    'insert into tipo_cuenta (nombre, descripcion) values ($1, $2) returning *',
    [t.nombre, t.descripcion]
  );
  return rows[0];
};

export const actualizar = async (id: number, t: TipoCuenta): Promise<TipoCuenta> => {
  const { rows } = await pool.query<TipoCuenta>(
    'update tipo_cuenta set nombre = $1, descripcion = $2 where id_tipo = $3 returning *',
    [t.nombre, t.descripcion, id]
  );
  if (!rows[0]) throw noEncontrado('Tipo de cuenta');
  return rows[0];
};

export const eliminar = async (id: number): Promise<void> => {
  const { rowCount } = await pool.query('delete from tipo_cuenta where id_tipo = $1', [id]);
  if (!rowCount) throw noEncontrado('Tipo de cuenta');
};

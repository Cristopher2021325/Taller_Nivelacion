import { pool } from '../config/db';
import { Sucursal } from '../models/sucursal.model';
import { noEncontrado } from '../utils/http-error';

export const obtenerTodos = async (): Promise<Sucursal[]> => {
  const { rows } = await pool.query<Sucursal>(
    'select id_sucursal, nombre, direccion, telefono from sucursal order by id_sucursal'
  );
  return rows;
};

export const obtenerPorId = async (id: number): Promise<Sucursal> => {
  const { rows } = await pool.query<Sucursal>(
    'select id_sucursal, nombre, direccion, telefono from sucursal where id_sucursal = $1',
    [id]
  );
  if (!rows[0]) throw noEncontrado('Sucursal');
  return rows[0];
};

export const crear = async (s: Sucursal): Promise<Sucursal> => {
  const { rows } = await pool.query<Sucursal>(
    'insert into sucursal (nombre, direccion, telefono) values ($1, $2, $3) returning *',
    [s.nombre, s.direccion, s.telefono]
  );
  return rows[0];
};

export const actualizar = async (id: number, s: Sucursal): Promise<Sucursal> => {
  const { rows } = await pool.query<Sucursal>(
    `update sucursal
        set nombre = $1, direccion = $2, telefono = $3
      where id_sucursal = $4
      returning *`,
    [s.nombre, s.direccion, s.telefono, id]
  );
  if (!rows[0]) throw noEncontrado('Sucursal');
  return rows[0];
};

export const eliminar = async (id: number): Promise<void> => {
  const { rowCount } = await pool.query('delete from sucursal where id_sucursal = $1', [id]);
  if (!rowCount) throw noEncontrado('Sucursal');
};

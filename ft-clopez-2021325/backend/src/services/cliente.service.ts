import { pool } from '../config/db';
import { Cliente } from '../models/cliente.model';
import { noEncontrado } from '../utils/http-error';

// q: busca por nombre, apellido, dpi o correo
export const obtenerTodos = async (q?: string): Promise<Cliente[]> => {
  if (q) {
    const { rows } = await pool.query<Cliente>(
      `select id_cliente, nombre, apellido, dpi, telefono, correo, estado from cliente
        where nombre || ' ' || apellido ilike $1 or dpi ilike $1 or correo ilike $1
        order by id_cliente`,
      [`%${q}%`]
    );
    return rows;
  }
  const { rows } = await pool.query<Cliente>(
    'select id_cliente, nombre, apellido, dpi, telefono, correo, estado from cliente order by id_cliente'
  );
  return rows;
};

export const obtenerPorId = async (id: number): Promise<Cliente> => {
  const { rows } = await pool.query<Cliente>(
    'select id_cliente, nombre, apellido, dpi, telefono, correo, estado from cliente where id_cliente = $1',
    [id]
  );
  if (!rows[0]) throw noEncontrado('Cliente');
  return rows[0];
};

export const crear = async (c: Cliente): Promise<Cliente> => {
  const { rows } = await pool.query<Cliente>(
    `insert into cliente (nombre, apellido, dpi, telefono, correo)
     values ($1, $2, $3, $4, $5)
     returning *`,
    [c.nombre, c.apellido, c.dpi, c.telefono, c.correo]
  );
  return rows[0];
};

export const actualizar = async (id: number, c: Cliente): Promise<Cliente> => {
  const { rows } = await pool.query<Cliente>(
    `update cliente
        set nombre = $1, apellido = $2, dpi = $3, telefono = $4, correo = $5
      where id_cliente = $6
      returning *`,
    [c.nombre, c.apellido, c.dpi, c.telefono, c.correo, id]
  );
  if (!rows[0]) throw noEncontrado('Cliente');
  return rows[0];
};

// desactivacion logica: el cliente y sus cuentas quedan inactivos (no se borra nada)
export const eliminar = async (id: number): Promise<void> => {
  const { rowCount } = await pool.query("update cliente set estado = 'inactivo' where id_cliente = $1", [id]);
  if (!rowCount) throw noEncontrado('Cliente');
  await pool.query("update cuenta set estado = 'inactiva' where id_cliente = $1", [id]);
};

export const reactivar = async (id: number): Promise<Cliente> => {
  const { rows } = await pool.query<Cliente>(
    "update cliente set estado = 'activo' where id_cliente = $1 returning *",
    [id]
  );
  if (!rows[0]) throw noEncontrado('Cliente');
  return rows[0];
};

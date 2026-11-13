import { pool } from '../config/db';
import { Cuenta } from '../models/cuenta.model';
import { noEncontrado } from '../utils/http-error';

const consultaBase = `
  select c.id_cuenta, c.numero_cuenta, c.saldo, c.fecha_apertura,
         c.id_tipo, c.id_cliente, c.id_sucursal, c.estado,
         t.nombre as tipo,
         cl.nombre || ' ' || cl.apellido as cliente,
         s.nombre as sucursal
    from cuenta c
   inner join tipo_cuenta t on t.id_tipo = c.id_tipo
   inner join cliente cl on cl.id_cliente = c.id_cliente
   inner join sucursal s on s.id_sucursal = c.id_sucursal`;

// q: busca por numero de cuenta o nombre/apellido/dpi del cliente
export const obtenerTodos = async (q?: string): Promise<Cuenta[]> => {
  if (q) {
    const { rows } = await pool.query<Cuenta>(
      `${consultaBase}
       where c.numero_cuenta ilike $1 or cl.nombre || ' ' || cl.apellido ilike $1 or cl.dpi ilike $1
       order by c.id_cuenta`,
      [`%${q}%`]
    );
    return rows;
  }
  const { rows } = await pool.query<Cuenta>(`${consultaBase} order by c.id_cuenta`);
  return rows;
};

export const obtenerPorId = async (id: number): Promise<Cuenta> => {
  const { rows } = await pool.query<Cuenta>(`${consultaBase} where c.id_cuenta = $1`, [id]);
  if (!rows[0]) throw noEncontrado('Cuenta');
  return rows[0];
};

export const obtenerPorCliente = async (idCliente: number): Promise<Cuenta[]> => {
  const { rows } = await pool.query<Cuenta>(
    `${consultaBase} where c.id_cliente = $1 order by c.id_cuenta`,
    [idCliente]
  );
  return rows;
};

export const crear = async (c: Cuenta): Promise<Cuenta> => {
  const { rows } = await pool.query<{ id_cuenta: number }>(
    `insert into cuenta (numero_cuenta, saldo, fecha_apertura, id_tipo, id_cliente, id_sucursal)
     values ($1, $2, $3, $4, $5, $6)
     returning id_cuenta`,
    [c.numero_cuenta, c.saldo, c.fecha_apertura, c.id_tipo, c.id_cliente, c.id_sucursal]
  );
  return obtenerPorId(rows[0].id_cuenta);
};

export const actualizar = async (id: number, c: Cuenta): Promise<Cuenta> => {
  const { rowCount } = await pool.query(
    `update cuenta
        set numero_cuenta = $1, saldo = $2, fecha_apertura = $3,
            id_tipo = $4, id_cliente = $5, id_sucursal = $6,
            estado = coalesce($7, estado)
      where id_cuenta = $8`,
    [c.numero_cuenta, c.saldo, c.fecha_apertura, c.id_tipo, c.id_cliente, c.id_sucursal, c.estado ?? null, id]
  );
  if (!rowCount) throw noEncontrado('Cuenta');
  return obtenerPorId(id);
};

export const eliminar = async (id: number): Promise<void> => {
  const { rowCount } = await pool.query('delete from cuenta where id_cuenta = $1', [id]);
  if (!rowCount) throw noEncontrado('Cuenta');
};

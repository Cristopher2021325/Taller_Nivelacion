import { pool } from '../config/db';
import { Empleado } from '../models/empleado.model';
import { noEncontrado } from '../utils/http-error';

const consultaBase = `
  select e.id_empleado, e.nombre, e.apellido, e.puesto, e.telefono,
         e.id_sucursal, s.nombre as sucursal
    from empleado e
   inner join sucursal s on s.id_sucursal = e.id_sucursal`;

export const obtenerTodos = async (): Promise<Empleado[]> => {
  const { rows } = await pool.query<Empleado>(`${consultaBase} order by e.id_empleado`);
  return rows;
};

export const obtenerPorId = async (id: number): Promise<Empleado> => {
  const { rows } = await pool.query<Empleado>(`${consultaBase} where e.id_empleado = $1`, [id]);
  if (!rows[0]) throw noEncontrado('Empleado');
  return rows[0];
};

export const crear = async (e: Empleado): Promise<Empleado> => {
  const { rows } = await pool.query<{ id_empleado: number }>(
    `insert into empleado (nombre, apellido, puesto, telefono, id_sucursal)
     values ($1, $2, $3, $4, $5)
     returning id_empleado`,
    [e.nombre, e.apellido, e.puesto, e.telefono, e.id_sucursal]
  );
  return obtenerPorId(rows[0].id_empleado);
};

export const actualizar = async (id: number, e: Empleado): Promise<Empleado> => {
  const { rowCount } = await pool.query(
    `update empleado
        set nombre = $1, apellido = $2, puesto = $3, telefono = $4, id_sucursal = $5
      where id_empleado = $6`,
    [e.nombre, e.apellido, e.puesto, e.telefono, e.id_sucursal, id]
  );
  if (!rowCount) throw noEncontrado('Empleado');
  return obtenerPorId(id);
};

export const eliminar = async (id: number): Promise<void> => {
  const { rowCount } = await pool.query('delete from empleado where id_empleado = $1', [id]);
  if (!rowCount) throw noEncontrado('Empleado');
};

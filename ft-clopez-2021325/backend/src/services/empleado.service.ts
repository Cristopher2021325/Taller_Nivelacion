import { consultar, ejecutar } from '../config/db';
import { Empleado } from '../models/empleado.model';
import { noEncontrado } from '../utils/http-error';

const consultaBase = `
  select e.id_empleado, e.nombre, e.apellido, e.puesto, e.telefono,
         e.id_sucursal, s.nombre as sucursal
    from empleado e
   inner join sucursal s on s.id_sucursal = e.id_sucursal`;

export const obtenerTodos = async (): Promise<Empleado[]> =>
  consultar<Empleado>(`${consultaBase} order by e.id_empleado`);

export const obtenerPorId = async (id: number): Promise<Empleado> => {
  const filas = await consultar<Empleado>(`${consultaBase} where e.id_empleado = ?`, [id]);
  if (!filas[0]) throw noEncontrado('Empleado');
  return filas[0];
};

export const crear = async (e: Empleado): Promise<Empleado> => {
  const resultado = await ejecutar(
    'insert into empleado (nombre, apellido, puesto, telefono, id_sucursal) values (?, ?, ?, ?, ?)',
    [e.nombre, e.apellido, e.puesto, e.telefono, e.id_sucursal]
  );
  return obtenerPorId(resultado.insertId);
};

export const actualizar = async (id: number, e: Empleado): Promise<Empleado> => {
  await obtenerPorId(id);
  await ejecutar(
    'update empleado set nombre = ?, apellido = ?, puesto = ?, telefono = ?, id_sucursal = ? where id_empleado = ?',
    [e.nombre, e.apellido, e.puesto, e.telefono, e.id_sucursal, id]
  );
  return obtenerPorId(id);
};

export const eliminar = async (id: number): Promise<void> => {
  const resultado = await ejecutar('delete from empleado where id_empleado = ?', [id]);
  if (!resultado.affectedRows) throw noEncontrado('Empleado');
};

import { consultar, ejecutar } from '../config/db';
import { Sucursal } from '../models/sucursal.model';
import { noEncontrado } from '../utils/http-error';

const columnas = 'id_sucursal, nombre, direccion, telefono';

export const obtenerTodos = async (): Promise<Sucursal[]> =>
  consultar<Sucursal>(`select ${columnas} from sucursal order by id_sucursal`);

export const obtenerPorId = async (id: number): Promise<Sucursal> => {
  const filas = await consultar<Sucursal>(`select ${columnas} from sucursal where id_sucursal = ?`, [id]);
  if (!filas[0]) throw noEncontrado('Sucursal');
  return filas[0];
};

export const crear = async (s: Sucursal): Promise<Sucursal> => {
  const resultado = await ejecutar('insert into sucursal (nombre, direccion, telefono) values (?, ?, ?)', [
    s.nombre,
    s.direccion,
    s.telefono,
  ]);
  return obtenerPorId(resultado.insertId);
};

export const actualizar = async (id: number, s: Sucursal): Promise<Sucursal> => {
  await obtenerPorId(id);
  await ejecutar('update sucursal set nombre = ?, direccion = ?, telefono = ? where id_sucursal = ?', [
    s.nombre,
    s.direccion,
    s.telefono,
    id,
  ]);
  return obtenerPorId(id);
};

export const eliminar = async (id: number): Promise<void> => {
  const resultado = await ejecutar('delete from sucursal where id_sucursal = ?', [id]);
  if (!resultado.affectedRows) throw noEncontrado('Sucursal');
};

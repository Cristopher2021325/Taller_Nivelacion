import { consultar, ejecutar } from '../config/db';
import { TipoCuenta } from '../models/tipo-cuenta.model';
import { noEncontrado } from '../utils/http-error';

const columnas = 'id_tipo, nombre, descripcion';

export const obtenerTodos = async (): Promise<TipoCuenta[]> =>
  consultar<TipoCuenta>(`select ${columnas} from tipo_cuenta order by id_tipo`);

export const obtenerPorId = async (id: number): Promise<TipoCuenta> => {
  const filas = await consultar<TipoCuenta>(`select ${columnas} from tipo_cuenta where id_tipo = ?`, [id]);
  if (!filas[0]) throw noEncontrado('Tipo de cuenta');
  return filas[0];
};

export const crear = async (t: TipoCuenta): Promise<TipoCuenta> => {
  const resultado = await ejecutar('insert into tipo_cuenta (nombre, descripcion) values (?, ?)', [
    t.nombre,
    t.descripcion,
  ]);
  return obtenerPorId(resultado.insertId);
};

export const actualizar = async (id: number, t: TipoCuenta): Promise<TipoCuenta> => {
  await obtenerPorId(id);
  await ejecutar('update tipo_cuenta set nombre = ?, descripcion = ? where id_tipo = ?', [t.nombre, t.descripcion, id]);
  return obtenerPorId(id);
};

export const eliminar = async (id: number): Promise<void> => {
  const resultado = await ejecutar('delete from tipo_cuenta where id_tipo = ?', [id]);
  if (!resultado.affectedRows) throw noEncontrado('Tipo de cuenta');
};

import { consultar, ejecutar } from '../config/db';
import { Cliente } from '../models/cliente.model';
import { noEncontrado } from '../utils/http-error';

const columnas = 'id_cliente, nombre, apellido, dpi, telefono, correo, estado';

// q: busca por nombre, apellido, dpi o correo
export const obtenerTodos = async (q?: string): Promise<Cliente[]> => {
  if (q) {
    const patron = `%${q}%`;
    return consultar<Cliente>(
      `select ${columnas} from cliente
        where concat(nombre, ' ', apellido) like ? or dpi like ? or correo like ?
        order by id_cliente`,
      [patron, patron, patron]
    );
  }
  return consultar<Cliente>(`select ${columnas} from cliente order by id_cliente`);
};

export const obtenerPorId = async (id: number): Promise<Cliente> => {
  const filas = await consultar<Cliente>(`select ${columnas} from cliente where id_cliente = ?`, [id]);
  if (!filas[0]) throw noEncontrado('Cliente');
  return filas[0];
};

export const crear = async (c: Cliente): Promise<Cliente> => {
  const resultado = await ejecutar(
    'insert into cliente (nombre, apellido, dpi, telefono, correo) values (?, ?, ?, ?, ?)',
    [c.nombre, c.apellido, c.dpi, c.telefono, c.correo]
  );
  return obtenerPorId(resultado.insertId);
};

export const actualizar = async (id: number, c: Cliente): Promise<Cliente> => {
  await obtenerPorId(id);
  await ejecutar(
    'update cliente set nombre = ?, apellido = ?, dpi = ?, telefono = ?, correo = ? where id_cliente = ?',
    [c.nombre, c.apellido, c.dpi, c.telefono, c.correo, id]
  );
  return obtenerPorId(id);
};

// desactivacion logica: el cliente y sus cuentas quedan inactivos (no se borra nada)
export const eliminar = async (id: number): Promise<void> => {
  await obtenerPorId(id);
  await ejecutar("update cliente set estado = 'inactivo' where id_cliente = ?", [id]);
  await ejecutar("update cuenta set estado = 'inactiva' where id_cliente = ?", [id]);
};

export const reactivar = async (id: number): Promise<Cliente> => {
  await obtenerPorId(id);
  await ejecutar("update cliente set estado = 'activo' where id_cliente = ?", [id]);
  return obtenerPorId(id);
};

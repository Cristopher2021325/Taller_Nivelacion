import { consultar, ejecutar } from '../config/db';
import { Cuenta } from '../models/cuenta.model';
import { noEncontrado } from '../utils/http-error';

const consultaBase = `
  select c.id_cuenta, c.numero_cuenta, c.saldo, c.fecha_apertura,
         c.id_tipo, c.id_cliente, c.id_sucursal, c.estado,
         t.nombre as tipo,
         concat(cl.nombre, ' ', cl.apellido) as cliente,
         s.nombre as sucursal
    from cuenta c
   inner join tipo_cuenta t on t.id_tipo = c.id_tipo
   inner join cliente cl on cl.id_cliente = c.id_cliente
   inner join sucursal s on s.id_sucursal = c.id_sucursal`;

// q: busca por numero de cuenta o nombre/apellido/dpi del cliente
export const obtenerTodos = async (q?: string): Promise<Cuenta[]> => {
  if (q) {
    const patron = `%${q}%`;
    return consultar<Cuenta>(
      `${consultaBase}
       where c.numero_cuenta like ? or concat(cl.nombre, ' ', cl.apellido) like ? or cl.dpi like ?
       order by c.id_cuenta`,
      [patron, patron, patron]
    );
  }
  return consultar<Cuenta>(`${consultaBase} order by c.id_cuenta`);
};

export const obtenerPorId = async (id: number): Promise<Cuenta> => {
  const filas = await consultar<Cuenta>(`${consultaBase} where c.id_cuenta = ?`, [id]);
  if (!filas[0]) throw noEncontrado('Cuenta');
  return filas[0];
};

export const obtenerPorCliente = async (idCliente: number): Promise<Cuenta[]> =>
  consultar<Cuenta>(`${consultaBase} where c.id_cliente = ? order by c.id_cuenta`, [idCliente]);

export const crear = async (c: Cuenta): Promise<Cuenta> => {
  const resultado = await ejecutar(
    `insert into cuenta (numero_cuenta, saldo, fecha_apertura, id_tipo, id_cliente, id_sucursal)
     values (?, ?, ?, ?, ?, ?)`,
    [c.numero_cuenta, c.saldo, c.fecha_apertura, c.id_tipo, c.id_cliente, c.id_sucursal]
  );
  return obtenerPorId(resultado.insertId);
};

export const actualizar = async (id: number, c: Cuenta): Promise<Cuenta> => {
  await obtenerPorId(id);
  await ejecutar(
    `update cuenta
        set numero_cuenta = ?, saldo = ?, fecha_apertura = ?,
            id_tipo = ?, id_cliente = ?, id_sucursal = ?,
            estado = coalesce(?, estado)
      where id_cuenta = ?`,
    [c.numero_cuenta, c.saldo, c.fecha_apertura, c.id_tipo, c.id_cliente, c.id_sucursal, c.estado ?? null, id]
  );
  return obtenerPorId(id);
};

export const eliminar = async (id: number): Promise<void> => {
  const resultado = await ejecutar('delete from cuenta where id_cuenta = ?', [id]);
  if (!resultado.affectedRows) throw noEncontrado('Cuenta');
};

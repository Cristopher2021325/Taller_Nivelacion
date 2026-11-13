import { consultar } from '../config/db';
import { noEncontrado } from '../utils/http-error';

const consultaBase = `
  select m.id_movimiento, m.tipo, m.monto, m.fecha, m.descripcion,
         m.id_cuenta, co.numero_cuenta as cuenta_origen,
         m.id_cuenta_destino, cd.numero_cuenta as cuenta_destino,
         u.username as usuario
    from movimiento m
   inner join cuenta co on co.id_cuenta = m.id_cuenta
    left join cuenta cd on cd.id_cuenta = m.id_cuenta_destino
    left join usuario u on u.id_usuario = m.id_usuario`;

export interface FiltroMovimientos {
  tipo?: string;
  desde?: string;
  hasta?: string;
}

export const obtenerTodos = async (f: FiltroMovimientos = {}) => {
  const condiciones: string[] = [];
  const params: unknown[] = [];
  if (f.tipo) {
    condiciones.push('m.tipo = ?');
    params.push(f.tipo);
  }
  if (f.desde) {
    condiciones.push('m.fecha >= ?');
    params.push(f.desde);
  }
  if (f.hasta) {
    condiciones.push('m.fecha < date_add(?, interval 1 day)');
    params.push(f.hasta);
  }
  const donde = condiciones.length ? `where ${condiciones.join(' and ')}` : '';
  return consultar(`${consultaBase} ${donde} order by m.fecha desc, m.id_movimiento desc`, params);
};

// movimientos donde la cuenta participa como origen o destino
export const obtenerPorCuenta = async (idCuenta: number) => {
  const existe = await consultar('select 1 from cuenta where id_cuenta = ?', [idCuenta]);
  if (!existe.length) throw noEncontrado('Cuenta');
  return consultar(
    `${consultaBase}
     where m.id_cuenta = ? or m.id_cuenta_destino = ?
     order by m.fecha desc, m.id_movimiento desc`,
    [idCuenta, idCuenta]
  );
};

export const resumen = async () => {
  const porTipo = await consultar('select * from vw_resumen_operaciones order by tipo');
  const totales = await consultar(
    `select (select count(*) from cliente where estado = 'activo') as clientes_activos,
            (select count(*) from cuenta where estado = 'activa')  as cuentas_activas,
            (select coalesce(sum(saldo), 0) from cuenta)           as saldo_total,
            (select count(*) from movimiento)                      as total_movimientos`
  );
  return { totales: totales[0], por_tipo: porTipo };
};

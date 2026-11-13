import { pool } from '../config/db';
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
  const { rows } = await pool.query(
    `${consultaBase}
     where ($1::text is null or m.tipo = $1)
       and ($2::date is null or m.fecha >= $2::date)
       and ($3::date is null or m.fecha < $3::date + 1)
     order by m.fecha desc, m.id_movimiento desc`,
    [f.tipo ?? null, f.desde ?? null, f.hasta ?? null]
  );
  return rows;
};

// movimientos donde la cuenta participa como origen o destino
export const obtenerPorCuenta = async (idCuenta: number) => {
  const existe = await pool.query('select 1 from cuenta where id_cuenta = $1', [idCuenta]);
  if (!existe.rowCount) throw noEncontrado('Cuenta');
  const { rows } = await pool.query(
    `${consultaBase}
     where m.id_cuenta = $1 or m.id_cuenta_destino = $1
     order by m.fecha desc, m.id_movimiento desc`,
    [idCuenta]
  );
  return rows;
};

export const resumen = async () => {
  const porTipo = await pool.query('select * from vw_resumen_operaciones order by tipo');
  const totales = await pool.query(
    `select (select count(*) from cliente where estado = 'activo')::int as clientes_activos,
            (select count(*) from cuenta where estado = 'activa')::int  as cuentas_activas,
            (select coalesce(sum(saldo), 0) from cuenta)               as saldo_total,
            (select count(*) from movimiento)::int                      as total_movimientos`
  );
  return { totales: totales.rows[0], por_tipo: porTipo.rows };
};

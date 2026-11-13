import { PoolClient } from 'pg';
import { pool } from '../config/db';
import { Movimiento, OperacionDto, TransferenciaDto } from '../models/movimiento.model';
import { HttpError, noEncontrado } from '../utils/http-error';

// ejecuta varias consultas como una sola transaccion (todo o nada)
export const ejecutarTransaccion = async <T>(accion: (client: PoolClient) => Promise<T>): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('begin');
    const resultado = await accion(client);
    await client.query('commit');
    return resultado;
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
};

// bloquea la fila de la cuenta (evita operaciones simultaneas) y valida que exista y este activa
export const bloquearCuentaActiva = async (client: PoolClient, idCuenta: number) => {
  const { rows } = await client.query<{ id_cuenta: number; saldo: number; estado: string }>(
    'select id_cuenta, saldo, estado from cuenta where id_cuenta = $1 for update',
    [idCuenta]
  );
  if (!rows[0]) throw noEncontrado('Cuenta');
  if (rows[0].estado !== 'activa') {
    throw new HttpError(409, 'La cuenta está inactiva y no puede realizar operaciones', 'CUENTA_INACTIVA');
  }
  return rows[0];
};

export const registrarMovimiento = async (
  client: PoolClient,
  tipo: Movimiento['tipo'],
  dto: OperacionDto,
  idUsuario: number | null,
  idCuentaDestino: number | null = null
): Promise<Movimiento> => {
  const { rows } = await client.query<Movimiento>(
    `insert into movimiento (tipo, monto, descripcion, id_cuenta, id_cuenta_destino, id_usuario)
     values ($1, $2, $3, $4, $5, $6)
     returning *`,
    [tipo, dto.monto, dto.descripcion ?? null, dto.id_cuenta, idCuentaDestino, idUsuario]
  );
  return rows[0];
};

export const depositar = (dto: OperacionDto, idUsuario: number | null) =>
  ejecutarTransaccion(async (client) => {
    await bloquearCuentaActiva(client, dto.id_cuenta);
    const { rows } = await client.query<{ saldo: number }>(
      'update cuenta set saldo = saldo + $1 where id_cuenta = $2 returning saldo',
      [dto.monto, dto.id_cuenta]
    );
    const movimiento = await registrarMovimiento(client, 'deposito', dto, idUsuario);
    return { movimiento, saldo_actual: rows[0].saldo };
  });

export const retirar = (dto: OperacionDto, idUsuario: number | null) =>
  ejecutarTransaccion(async (client) => {
    const cuenta = await bloquearCuentaActiva(client, dto.id_cuenta);
    if (dto.monto > cuenta.saldo) {
      throw new HttpError(422, 'Saldo insuficiente para realizar el retiro', 'SALDO_INSUFICIENTE');
    }
    const { rows } = await client.query<{ saldo: number }>(
      'update cuenta set saldo = saldo - $1 where id_cuenta = $2 returning saldo',
      [dto.monto, dto.id_cuenta]
    );
    const movimiento = await registrarMovimiento(client, 'retiro', dto, idUsuario);
    return { movimiento, saldo_actual: rows[0].saldo };
  });

export const transferir = (dto: TransferenciaDto, idUsuario: number | null) =>
  ejecutarTransaccion(async (client) => {
    // regla 7: no se puede transferir hacia la misma cuenta
    if (dto.id_cuenta_origen === dto.id_cuenta_destino) {
      throw new HttpError(400, 'No se puede transferir hacia la misma cuenta', 'MISMA_CUENTA');
    }
    // se bloquean en orden de id para evitar interbloqueos entre transferencias cruzadas
    const [menor, mayor] = [dto.id_cuenta_origen, dto.id_cuenta_destino].sort((a, b) => a - b);
    const primera = await bloquearCuentaActiva(client, menor);
    const segunda = await bloquearCuentaActiva(client, mayor);
    const origen = primera.id_cuenta === dto.id_cuenta_origen ? primera : segunda;

    // regla 6: la cuenta origen debe tener saldo suficiente
    if (dto.monto > origen.saldo) {
      throw new HttpError(422, 'Saldo insuficiente en la cuenta origen', 'SALDO_INSUFICIENTE');
    }
    await client.query('update cuenta set saldo = saldo - $1 where id_cuenta = $2', [dto.monto, dto.id_cuenta_origen]);
    await client.query('update cuenta set saldo = saldo + $1 where id_cuenta = $2', [dto.monto, dto.id_cuenta_destino]);

    const movimiento = await registrarMovimiento(
      client,
      'transferencia',
      { id_cuenta: dto.id_cuenta_origen, monto: dto.monto, descripcion: dto.descripcion },
      idUsuario,
      dto.id_cuenta_destino
    );
    const { rows } = await client.query(
      `insert into transferencia (id_cuenta_origen, id_cuenta_destino, monto, id_movimiento)
       values ($1, $2, $3, $4) returning *`,
      [dto.id_cuenta_origen, dto.id_cuenta_destino, dto.monto, movimiento.id_movimiento]
    );
    const { rows: saldos } = await client.query<{ id_cuenta: number; saldo: number }>(
      'select id_cuenta, saldo from cuenta where id_cuenta in ($1, $2)',
      [dto.id_cuenta_origen, dto.id_cuenta_destino]
    );
    return {
      movimiento,
      transferencia: rows[0],
      saldo_origen: saldos.find((c) => c.id_cuenta === dto.id_cuenta_origen)?.saldo,
      saldo_destino: saldos.find((c) => c.id_cuenta === dto.id_cuenta_destino)?.saldo,
    };
  });

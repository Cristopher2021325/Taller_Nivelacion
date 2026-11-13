import { PoolConnection } from 'mysql2/promise';
import { consultar, ejecutar, pool } from '../config/db';
import { Movimiento, OperacionDto, TransferenciaDto } from '../models/movimiento.model';
import { HttpError, noEncontrado } from '../utils/http-error';

// ejecuta varias consultas como una sola transaccion (todo o nada)
export const ejecutarTransaccion = async <T>(accion: (conexion: PoolConnection) => Promise<T>): Promise<T> => {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    const resultado = await accion(conexion);
    await conexion.commit();
    return resultado;
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
};

// bloquea la fila de la cuenta (evita operaciones simultaneas) y valida que exista y este activa
export const bloquearCuentaActiva = async (conexion: PoolConnection, idCuenta: number) => {
  const filas = await consultar<{ id_cuenta: number; saldo: number; estado: string }>(
    'select id_cuenta, saldo, estado from cuenta where id_cuenta = ? for update',
    [idCuenta],
    conexion
  );
  if (!filas[0]) throw noEncontrado('Cuenta');
  if (filas[0].estado !== 'activa') {
    throw new HttpError(409, 'La cuenta está inactiva y no puede realizar operaciones', 'CUENTA_INACTIVA');
  }
  return filas[0];
};

const saldoDe = async (conexion: PoolConnection, idCuenta: number): Promise<number> => {
  const filas = await consultar<{ saldo: number }>('select saldo from cuenta where id_cuenta = ?', [idCuenta], conexion);
  return filas[0].saldo;
};

export const registrarMovimiento = async (
  conexion: PoolConnection,
  tipo: Movimiento['tipo'],
  dto: OperacionDto,
  idUsuario: number | null,
  idCuentaDestino: number | null = null
): Promise<Movimiento> => {
  const resultado = await ejecutar(
    `insert into movimiento (tipo, monto, descripcion, id_cuenta, id_cuenta_destino, id_usuario)
     values (?, ?, ?, ?, ?, ?)`,
    [tipo, dto.monto, dto.descripcion ?? null, dto.id_cuenta, idCuentaDestino, idUsuario],
    conexion
  );
  const filas = await consultar<Movimiento>(
    'select * from movimiento where id_movimiento = ?',
    [resultado.insertId],
    conexion
  );
  return filas[0];
};

export const depositar = (dto: OperacionDto, idUsuario: number | null) =>
  ejecutarTransaccion(async (conexion) => {
    await bloquearCuentaActiva(conexion, dto.id_cuenta);
    await ejecutar('update cuenta set saldo = saldo + ? where id_cuenta = ?', [dto.monto, dto.id_cuenta], conexion);
    const movimiento = await registrarMovimiento(conexion, 'deposito', dto, idUsuario);
    return { movimiento, saldo_actual: await saldoDe(conexion, dto.id_cuenta) };
  });

export const retirar = (dto: OperacionDto, idUsuario: number | null) =>
  ejecutarTransaccion(async (conexion) => {
    const cuenta = await bloquearCuentaActiva(conexion, dto.id_cuenta);
    if (dto.monto > cuenta.saldo) {
      throw new HttpError(422, 'Saldo insuficiente para realizar el retiro', 'SALDO_INSUFICIENTE');
    }
    await ejecutar('update cuenta set saldo = saldo - ? where id_cuenta = ?', [dto.monto, dto.id_cuenta], conexion);
    const movimiento = await registrarMovimiento(conexion, 'retiro', dto, idUsuario);
    return { movimiento, saldo_actual: await saldoDe(conexion, dto.id_cuenta) };
  });

export const transferir = (dto: TransferenciaDto, idUsuario: number | null) =>
  ejecutarTransaccion(async (conexion) => {
    // regla 7: no se puede transferir hacia la misma cuenta
    if (dto.id_cuenta_origen === dto.id_cuenta_destino) {
      throw new HttpError(400, 'No se puede transferir hacia la misma cuenta', 'MISMA_CUENTA');
    }
    // se bloquean en orden de id para evitar interbloqueos entre transferencias cruzadas
    const [menor, mayor] = [dto.id_cuenta_origen, dto.id_cuenta_destino].sort((a, b) => a - b);
    const primera = await bloquearCuentaActiva(conexion, menor);
    const segunda = await bloquearCuentaActiva(conexion, mayor);
    const origen = primera.id_cuenta === dto.id_cuenta_origen ? primera : segunda;

    // regla 6: la cuenta origen debe tener saldo suficiente
    if (dto.monto > origen.saldo) {
      throw new HttpError(422, 'Saldo insuficiente en la cuenta origen', 'SALDO_INSUFICIENTE');
    }
    await ejecutar('update cuenta set saldo = saldo - ? where id_cuenta = ?', [dto.monto, dto.id_cuenta_origen], conexion);
    await ejecutar('update cuenta set saldo = saldo + ? where id_cuenta = ?', [dto.monto, dto.id_cuenta_destino], conexion);

    const movimiento = await registrarMovimiento(
      conexion,
      'transferencia',
      { id_cuenta: dto.id_cuenta_origen, monto: dto.monto, descripcion: dto.descripcion },
      idUsuario,
      dto.id_cuenta_destino
    );
    const resultado = await ejecutar(
      `insert into transferencia (id_cuenta_origen, id_cuenta_destino, monto, id_movimiento)
       values (?, ?, ?, ?)`,
      [dto.id_cuenta_origen, dto.id_cuenta_destino, dto.monto, movimiento.id_movimiento],
      conexion
    );
    const transferencia = (
      await consultar('select * from transferencia where id_transferencia = ?', [resultado.insertId], conexion)
    )[0];
    return {
      movimiento,
      transferencia,
      saldo_origen: await saldoDe(conexion, dto.id_cuenta_origen),
      saldo_destino: await saldoDe(conexion, dto.id_cuenta_destino),
    };
  });

export type TipoMovimiento = 'deposito' | 'retiro' | 'transferencia';

export interface Movimiento {
  id_movimiento: number;
  tipo: TipoMovimiento;
  monto: number;
  fecha: string;
  descripcion: string | null;
  id_cuenta: number;
  cuenta_origen: string;
  id_cuenta_destino: number | null;
  cuenta_destino: string | null;
  usuario: string | null;
}

export interface ResultadoOperacion {
  movimiento: Movimiento;
  saldo_actual?: number;
  saldo_origen?: number;
  saldo_destino?: number;
}

export interface ResumenOperaciones {
  totales: {
    clientes_activos: number;
    cuentas_activas: number;
    saldo_total: number;
    total_movimientos: number;
  };
  por_tipo: {
    tipo: TipoMovimiento;
    cantidad: number | string;
    total_monto: number;
    promedio_monto: number;
    primera_operacion: string;
    ultima_operacion: string;
  }[];
}

export type TipoMovimiento = 'deposito' | 'retiro' | 'transferencia';

export interface Movimiento {
  id_movimiento: number;
  tipo: TipoMovimiento;
  monto: number;
  fecha: string;
  descripcion: string | null;
  id_cuenta: number;
  id_cuenta_destino: number | null;
  id_usuario: number | null;
}

export interface OperacionDto {
  id_cuenta: number;
  monto: number;
  descripcion?: string;
}

export interface TransferenciaDto {
  id_cuenta_origen: number;
  id_cuenta_destino: number;
  monto: number;
  descripcion?: string;
}

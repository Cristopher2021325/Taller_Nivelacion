export interface Cuenta {
  id_cuenta?: number;
  numero_cuenta: string;
  saldo: number;
  fecha_apertura: string;
  id_tipo: number;
  id_cliente: number;
  id_sucursal: number;
  estado?: 'activa' | 'inactiva';
  // datos de solo lectura obtenidos con join
  tipo?: string;
  cliente?: string;
  sucursal?: string;
}

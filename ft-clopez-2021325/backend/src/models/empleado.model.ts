export interface Empleado {
  id_empleado?: number;
  nombre: string;
  apellido: string;
  puesto: string;
  telefono: string;
  id_sucursal: number;
  // dato de solo lectura obtenido con join
  sucursal?: string;
}

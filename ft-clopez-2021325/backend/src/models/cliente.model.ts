export interface Cliente {
  id_cliente?: number;
  nombre: string;
  apellido: string;
  dpi: string;
  telefono: string;
  correo: string;
  estado?: 'activo' | 'inactivo';
}

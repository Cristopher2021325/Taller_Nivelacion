export type Rol = 'admin' | 'usuario';

export interface Usuario {
  id_usuario: number;
  nombre: string;
  username: string;
  password: string;
  rol: Rol;
}

export interface UsuarioToken {
  id_usuario: number;
  nombre: string;
  username: string;
  rol: Rol;
}

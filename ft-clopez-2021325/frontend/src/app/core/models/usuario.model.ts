export type Rol = 'admin' | 'usuario';

export interface Usuario {
  id_usuario: number;
  nombre: string;
  username: string;
  rol: Rol;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  mensaje: string;
  token: string;
  usuario: Usuario;
}

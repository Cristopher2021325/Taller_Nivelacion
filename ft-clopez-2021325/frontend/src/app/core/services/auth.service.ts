import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, Usuario } from '../models/usuario.model';

const CLAVE_TOKEN = 'banco_token';
const CLAVE_USUARIO = 'banco_usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly url = `${environment.apiUrl}/auth`;

  private readonly usuarioActual = signal<Usuario | null>(this.leerUsuario());

  readonly usuario = this.usuarioActual.asReadonly();
  readonly esAdmin = computed(() => this.usuarioActual()?.rol === 'admin');

  login(datos: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.url}/login`, datos).pipe(
      tap((respuesta) => {
        localStorage.setItem(CLAVE_TOKEN, respuesta.token);
        localStorage.setItem(CLAVE_USUARIO, JSON.stringify(respuesta.usuario));
        this.usuarioActual.set(respuesta.usuario);
      })
    );
  }

  logout(redirigir = true): void {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
    this.usuarioActual.set(null);
    if (redirigir) {
      this.router.navigate(['/login']);
    }
  }

  obtenerToken(): string | null {
    return localStorage.getItem(CLAVE_TOKEN);
  }

  estaAutenticado(): boolean {
    const token = this.obtenerToken();
    return !!token && !this.tokenExpirado(token);
  }

  tokenExpirado(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private leerUsuario(): Usuario | null {
    const texto = localStorage.getItem(CLAVE_USUARIO);
    if (!texto) return null;
    try {
      return JSON.parse(texto) as Usuario;
    } catch {
      return null;
    }
  }
}

import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificacionService } from '../../../core/services/notificacion.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  protected readonly auth = inject(AuthService);
  private readonly notificacion = inject(NotificacionService);

  protected menuAbierto = false;

  protected readonly opciones = [
    { ruta: '/inicio', texto: 'Inicio', icono: 'bi-house', admin: false },
    { ruta: '/clientes', texto: 'Clientes', icono: 'bi-people', admin: false },
    { ruta: '/cuentas', texto: 'Cuentas', icono: 'bi-credit-card-2-front', admin: false },
    { ruta: '/operaciones', texto: 'Operaciones', icono: 'bi-cash-coin', admin: true },
    { ruta: '/movimientos', texto: 'Movimientos', icono: 'bi-clock-history', admin: false },
    { ruta: '/reportes', texto: 'Reportes', icono: 'bi-bar-chart-line', admin: false },
    { ruta: '/tipos-cuenta', texto: 'Tipos de cuenta', icono: 'bi-tags', admin: false },
    { ruta: '/sucursales', texto: 'Sucursales', icono: 'bi-bank', admin: false },
    { ruta: '/empleados', texto: 'Empleados', icono: 'bi-person-badge', admin: false },
  ];

  cerrarSesion(): void {
    this.auth.logout();
    this.notificacion.info('La sesión se cerró correctamente.', 'Sesión cerrada');
  }
}

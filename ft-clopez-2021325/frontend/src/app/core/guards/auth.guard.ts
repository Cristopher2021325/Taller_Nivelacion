import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificacionService } from '../services/notificacion.service';

// solo permite el acceso si existe un token vigente
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificacion = inject(NotificacionService);

  if (authService.estaAutenticado()) {
    return true;
  }

  if (authService.obtenerToken()) {
    notificacion.advertencia('Su sesión ha expirado, inicie sesión nuevamente.', 'Sesión expirada');
    authService.logout(false);
  }

  return router.createUrlTree(['/login']);
};

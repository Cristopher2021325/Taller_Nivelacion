import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificacionService } from '../services/notificacion.service';

// restringe rutas de registro y edicion al rol administrador
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificacion = inject(NotificacionService);

  if (authService.esAdmin()) {
    return true;
  }

  notificacion.error('No tiene permisos para acceder a esta opción.', 'Acceso denegado');
  return router.createUrlTree(['/inicio']);
};

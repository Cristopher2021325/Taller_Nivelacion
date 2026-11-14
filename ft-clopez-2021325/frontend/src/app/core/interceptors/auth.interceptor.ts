import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ErrorApi } from '../models/api.model';
import { AuthService } from '../services/auth.service';
import { NotificacionService } from '../services/notificacion.service';

// agrega el token jwt a las peticiones hacia la api y maneja los errores globales
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificacion = inject(NotificacionService);

  const esApi = req.url.startsWith(environment.apiUrl);
  const esLogin = req.url.endsWith('/auth/login');
  const token = authService.obtenerToken();

  const peticion =
    esApi && !esLogin && token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      const cuerpo = error.error as ErrorApi | null;

      if (error.status === 0) {
        notificacion.error('No fue posible conectar con el servidor. Verifique que la API esté en ejecución.', 'Sin conexión');
      } else if (error.status === 401 && !esLogin) {
        if (cuerpo?.codigo === 'TOKEN_EXPIRADO') {
          notificacion.advertencia('Su sesión ha expirado, inicie sesión nuevamente.', 'Sesión expirada');
        } else {
          notificacion.advertencia(cuerpo?.mensaje ?? 'Debe iniciar sesión.', 'No autenticado');
        }
        authService.logout();
      } else if (error.status === 403) {
        notificacion.error(cuerpo?.mensaje ?? 'No tiene permisos para realizar esta operación.', 'Acceso denegado');
      } else if (error.status >= 500) {
        notificacion.error(cuerpo?.mensaje ?? 'Ocurrió un error en el servidor.', 'Error del servidor');
      }

      return throwError(() => error);
    })
  );
};

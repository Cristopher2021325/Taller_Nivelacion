import { HttpErrorResponse } from '@angular/common/http';
import { ErrorApi } from '../../core/models/api.model';

// obtiene un mensaje legible a partir de la respuesta de error de la api
export const mensajeDeError = (error: HttpErrorResponse): string => {
  const cuerpo = error.error as ErrorApi | null;

  if (error.status === 0) return 'No fue posible conectar con el servidor.';
  if (cuerpo?.errores?.length) {
    return cuerpo.errores.map((e) => e.mensaje).join('. ');
  }
  return cuerpo?.mensaje ?? 'Ocurrió un error inesperado.';
};

// indica si el error ya fue notificado por el interceptor
export const errorGlobal = (error: HttpErrorResponse): boolean =>
  error.status === 0 || error.status === 401 || error.status === 403 || error.status >= 500;

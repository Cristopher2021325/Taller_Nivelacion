export interface RespuestaApi<T> {
  mensaje: string;
  data: T;
}

export interface MensajeApi {
  mensaje: string;
}

export interface ErrorCampo {
  campo: string;
  mensaje: string;
}

export interface ErrorApi {
  mensaje: string;
  codigo?: string;
  errores?: ErrorCampo[];
}

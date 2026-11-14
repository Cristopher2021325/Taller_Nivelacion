import { Injectable, signal } from '@angular/core';

export interface SolicitudConfirmacion {
  titulo: string;
  mensaje: string;
  textoBoton: string;
  responder: (aceptado: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmacionService {
  readonly solicitud = signal<SolicitudConfirmacion | null>(null);

  confirmar(mensaje: string, titulo = 'Confirmar eliminación', textoBoton = 'Eliminar'): Promise<boolean> {
    return new Promise((resolve) => {
      this.solicitud.set({
        titulo,
        mensaje,
        textoBoton,
        responder: (aceptado: boolean) => {
          this.solicitud.set(null);
          resolve(aceptado);
        },
      });
    });
  }
}

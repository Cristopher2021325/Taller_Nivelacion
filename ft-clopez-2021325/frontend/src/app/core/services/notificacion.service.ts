import { Injectable, signal } from '@angular/core';

export type TipoNotificacion = 'success' | 'danger' | 'warning' | 'info';

export interface Notificacion {
  id: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
}

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private contador = 0;
  private readonly lista = signal<Notificacion[]>([]);

  readonly notificaciones = this.lista.asReadonly();

  exito(mensaje: string, titulo = 'Operación exitosa'): void {
    this.mostrar('success', titulo, mensaje);
  }

  error(mensaje: string, titulo = 'Error'): void {
    this.mostrar('danger', titulo, mensaje, 6000);
  }

  advertencia(mensaje: string, titulo = 'Atención'): void {
    this.mostrar('warning', titulo, mensaje, 6000);
  }

  info(mensaje: string, titulo = 'Información'): void {
    this.mostrar('info', titulo, mensaje);
  }

  cerrar(id: number): void {
    this.lista.update((actual) => actual.filter((n) => n.id !== id));
  }

  private mostrar(tipo: TipoNotificacion, titulo: string, mensaje: string, duracion = 4000): void {
    // evita repetir el mismo mensaje si ya esta visible
    if (this.lista().some((n) => n.mensaje === mensaje)) return;

    const id = ++this.contador;
    // se mantienen visibles como maximo tres notificaciones
    this.lista.update((actual) => [...actual, { id, tipo, titulo, mensaje }].slice(-3));
    setTimeout(() => this.cerrar(id), duracion);
  }
}

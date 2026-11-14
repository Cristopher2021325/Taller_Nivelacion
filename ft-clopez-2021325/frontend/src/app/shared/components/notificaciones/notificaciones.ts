import { Component, inject } from '@angular/core';
import { NotificacionService } from '../../../core/services/notificacion.service';

@Component({
  selector: 'app-notificaciones',
  template: `
    <div class="toast-container position-fixed top-0 end-0 p-3">
      @for (n of servicio.notificaciones(); track n.id) {
        <div class="toast show border-0 shadow aviso aviso-{{ n.tipo }}" role="alert">
          <div class="d-flex align-items-start p-3 gap-2">
            <i class="bi fs-5" [class]="icono(n.tipo)"></i>
            <div class="flex-grow-1">
              <strong class="d-block">{{ n.titulo }}</strong>
              <span class="small">{{ n.mensaje }}</span>
            </div>
            <button type="button" class="btn-close" aria-label="Cerrar" (click)="servicio.cerrar(n.id)"></button>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .toast-container { z-index: 1100; margin-top: 60px; }
    .aviso { border-left: 5px solid !important; background: #fff; }
    .aviso-success { border-left-color: var(--bs-success) !important; }
    .aviso-success i { color: var(--bs-success); }
    .aviso-danger { border-left-color: var(--bs-danger) !important; }
    .aviso-danger i { color: var(--bs-danger); }
    .aviso-warning { border-left-color: var(--bs-warning) !important; }
    .aviso-warning i { color: #b58100; }
    .aviso-info { border-left-color: var(--bs-info) !important; }
    .aviso-info i { color: var(--bs-info); }
  `,
})
export class Notificaciones {
  protected readonly servicio = inject(NotificacionService);

  icono(tipo: string): string {
    const iconos: Record<string, string> = {
      success: 'bi-check-circle-fill',
      danger: 'bi-x-octagon-fill',
      warning: 'bi-exclamation-triangle-fill',
      info: 'bi-info-circle-fill',
    };
    return `bi fs-5 ${iconos[tipo]}`;
  }
}

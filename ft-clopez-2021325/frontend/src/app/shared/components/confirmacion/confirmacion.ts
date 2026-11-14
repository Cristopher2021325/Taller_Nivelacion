import { Component, inject } from '@angular/core';
import { ConfirmacionService } from '../../../core/services/confirmacion.service';

@Component({
  selector: 'app-confirmacion',
  template: `
    @if (servicio.solicitud(); as s) {
      <div class="modal d-block" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header">
              <h5 class="modal-title"><i class="bi bi-exclamation-triangle text-danger me-2"></i>{{ s.titulo }}</h5>
              <button type="button" class="btn-close" (click)="s.responder(false)"></button>
            </div>
            <div class="modal-body">{{ s.mensaje }}</div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" (click)="s.responder(false)">Cancelar</button>
              <button type="button" class="btn btn-danger" (click)="s.responder(true)">
                <i class="bi bi-trash me-1"></i>{{ s.textoBoton }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show"></div>
    }
  `,
})
export class Confirmacion {
  protected readonly servicio = inject(ConfirmacionService);
}

import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Cuenta } from '../../../core/models/cuenta.model';
import { TipoCuenta } from '../../../core/models/tipo-cuenta.model';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmacionService } from '../../../core/services/confirmacion.service';
import { CuentaService } from '../../../core/services/cuenta.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { TipoCuentaService } from '../../../core/services/tipo-cuenta.service';
import { errorGlobal, mensajeDeError } from '../../../shared/utils/errores';

@Component({
  selector: 'app-tipo-cuenta-detalle',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './tipo-cuenta-detalle.html',
})
export class TipoCuentaDetalle implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly servicio = inject(TipoCuentaService);
  private readonly cuentaService = inject(CuentaService);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly notificacion = inject(NotificacionService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  protected readonly tipo = signal<TipoCuenta | null>(null);
  protected readonly cuentas = signal<Cuenta[]>([]);

  ngOnInit(): void {
    const id = Number(this.id());
    forkJoin({ tipo: this.servicio.obtener(id), cuentas: this.cuentaService.listar() }).subscribe({
      next: (r) => {
        this.tipo.set(r.tipo);
        this.cuentas.set(r.cuentas.filter((c) => c.id_tipo === id));
      },
      error: (err: HttpErrorResponse) => {
        if (!errorGlobal(err)) this.notificacion.error(mensajeDeError(err));
        this.router.navigate(['/tipos-cuenta']);
      },
    });
  }

  async eliminar(): Promise<void> {
    const t = this.tipo();
    if (!t) return;
    const aceptado = await this.confirmacion.confirmar(`¿Desea eliminar el tipo de cuenta "${t.nombre}"?`);
    if (!aceptado) return;

    this.servicio.eliminar(t.id_tipo!).subscribe({
      next: (r) => {
        this.notificacion.exito(r.mensaje);
        this.router.navigate(['/tipos-cuenta']);
      },
      error: (err: HttpErrorResponse) => {
        if (!errorGlobal(err)) this.notificacion.error(mensajeDeError(err), 'No se pudo eliminar');
      },
    });
  }
}

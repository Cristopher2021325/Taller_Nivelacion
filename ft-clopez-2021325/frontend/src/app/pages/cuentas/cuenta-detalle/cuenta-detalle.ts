import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Cuenta } from '../../../core/models/cuenta.model';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmacionService } from '../../../core/services/confirmacion.service';
import { CuentaService } from '../../../core/services/cuenta.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { errorGlobal, mensajeDeError } from '../../../shared/utils/errores';

@Component({
  selector: 'app-cuenta-detalle',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './cuenta-detalle.html',
})
export class CuentaDetalle implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly servicio = inject(CuentaService);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly notificacion = inject(NotificacionService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  protected readonly cuenta = signal<Cuenta | null>(null);

  ngOnInit(): void {
    this.servicio.obtener(Number(this.id())).subscribe({
      next: (c) => this.cuenta.set(c),
      error: (err: HttpErrorResponse) => {
        if (!errorGlobal(err)) this.notificacion.error(mensajeDeError(err));
        this.router.navigate(['/cuentas']);
      },
    });
  }

  async eliminar(): Promise<void> {
    const c = this.cuenta();
    if (!c) return;
    const aceptado = await this.confirmacion.confirmar(`¿Desea eliminar la cuenta ${c.numero_cuenta}?`);
    if (!aceptado) return;

    this.servicio.eliminar(c.id_cuenta!).subscribe({
      next: (r) => {
        this.notificacion.exito(r.mensaje);
        this.router.navigate(['/cuentas']);
      },
      error: (err: HttpErrorResponse) => {
        if (!errorGlobal(err)) this.notificacion.error(mensajeDeError(err), 'No se pudo eliminar');
      },
    });
  }
}

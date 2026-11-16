import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Cliente } from '../../../core/models/cliente.model';
import { Cuenta } from '../../../core/models/cuenta.model';
import { AuthService } from '../../../core/services/auth.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { ConfirmacionService } from '../../../core/services/confirmacion.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { errorGlobal, mensajeDeError } from '../../../shared/utils/errores';

@Component({
  selector: 'app-cliente-detalle',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './cliente-detalle.html',
})
export class ClienteDetalle implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly servicio = inject(ClienteService);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly notificacion = inject(NotificacionService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  protected readonly cliente = signal<Cliente | null>(null);
  protected readonly cuentas = signal<Cuenta[]>([]);
  protected readonly saldoTotal = computed(() => this.cuentas().reduce((s, c) => s + Number(c.saldo), 0));

  ngOnInit(): void {
    const id = Number(this.id());
    forkJoin({ cliente: this.servicio.obtener(id), cuentas: this.servicio.listarCuentas(id) }).subscribe({
      next: (r) => {
        this.cliente.set(r.cliente);
        this.cuentas.set(r.cuentas);
      },
      error: (err: HttpErrorResponse) => {
        if (!errorGlobal(err)) this.notificacion.error(mensajeDeError(err));
        this.router.navigate(['/clientes']);
      },
    });
  }

  async eliminar(): Promise<void> {
    const c = this.cliente();
    if (!c) return;
    const aceptado = await this.confirmacion.confirmar(`¿Desea eliminar al cliente ${c.nombre} ${c.apellido}?`);
    if (!aceptado) return;

    this.servicio.eliminar(c.id_cliente!).subscribe({
      next: (r) => {
        this.notificacion.exito(r.mensaje);
        this.router.navigate(['/clientes']);
      },
      error: (err: HttpErrorResponse) => {
        if (!errorGlobal(err)) this.notificacion.error(mensajeDeError(err), 'No se pudo eliminar');
      },
    });
  }
}

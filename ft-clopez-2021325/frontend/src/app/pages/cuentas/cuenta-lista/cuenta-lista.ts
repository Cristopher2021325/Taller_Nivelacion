import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Cuenta } from '../../../core/models/cuenta.model';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmacionService } from '../../../core/services/confirmacion.service';
import { CuentaService } from '../../../core/services/cuenta.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { errorGlobal, mensajeDeError } from '../../../shared/utils/errores';

@Component({
  selector: 'app-cuenta-lista',
  imports: [RouterLink, FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './cuenta-lista.html',
})
export class CuentaLista implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly servicio = inject(CuentaService);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly notificacion = inject(NotificacionService);

  protected readonly cuentas = signal<Cuenta[]>([]);
  protected readonly cargando = signal(true);
  protected readonly filtro = signal('');

  protected readonly filtradas = computed(() => {
    const texto = this.filtro().trim().toLowerCase();
    if (!texto) return this.cuentas();
    return this.cuentas().filter((c) =>
      `${c.numero_cuenta} ${c.cliente} ${c.tipo} ${c.sucursal}`.toLowerCase().includes(texto)
    );
  });

  protected readonly saldoTotal = computed(() => this.filtradas().reduce((s, c) => s + Number(c.saldo), 0));

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.servicio.listar().subscribe({
      next: (datos) => {
        this.cuentas.set(datos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  async eliminar(cuenta: Cuenta): Promise<void> {
    const aceptado = await this.confirmacion.confirmar(
      `¿Desea eliminar la cuenta ${cuenta.numero_cuenta} de ${cuenta.cliente}? Esta acción no se puede deshacer.`
    );
    if (!aceptado) return;

    this.servicio.eliminar(cuenta.id_cuenta!).subscribe({
      next: (r) => {
        this.notificacion.exito(r.mensaje);
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        if (!errorGlobal(err)) this.notificacion.error(mensajeDeError(err), 'No se pudo eliminar');
      },
    });
  }

  async cambiarEstado(cuenta: Cuenta): Promise<void> {
    const nuevo = cuenta.estado === 'inactiva' ? 'activa' : 'inactiva';
    const aceptado = await this.confirmacion.confirmar(
      `¿Desea marcar la cuenta ${cuenta.numero_cuenta} como ${nuevo}? ${nuevo === 'inactiva' ? 'Una cuenta inactiva no puede realizar operaciones.' : ''}`
    );
    if (!aceptado) return;

    this.servicio.actualizar(cuenta.id_cuenta!, { ...cuenta, estado: nuevo }).subscribe({
      next: () => {
        this.notificacion.exito(`La cuenta ahora está ${nuevo}.`);
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        if (!errorGlobal(err)) this.notificacion.error(mensajeDeError(err), 'No se pudo actualizar');
      },
    });
  }
}

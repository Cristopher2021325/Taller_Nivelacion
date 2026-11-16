import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Cliente } from '../../../core/models/cliente.model';
import { AuthService } from '../../../core/services/auth.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { ConfirmacionService } from '../../../core/services/confirmacion.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { errorGlobal, mensajeDeError } from '../../../shared/utils/errores';

@Component({
  selector: 'app-cliente-lista',
  imports: [RouterLink, FormsModule],
  templateUrl: './cliente-lista.html',
})
export class ClienteLista implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly servicio = inject(ClienteService);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly notificacion = inject(NotificacionService);

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly cargando = signal(true);
  protected readonly filtro = signal('');

  protected readonly filtrados = computed(() => {
    const texto = this.filtro().trim().toLowerCase();
    if (!texto) return this.clientes();
    return this.clientes().filter((c) =>
      `${c.nombre} ${c.apellido} ${c.dpi} ${c.correo} ${c.telefono}`.toLowerCase().includes(texto)
    );
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.servicio.listar().subscribe({
      next: (datos) => {
        this.clientes.set(datos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  async eliminar(cliente: Cliente): Promise<void> {
    const aceptado = await this.confirmacion.confirmar(
      `¿Desea desactivar al cliente ${cliente.nombre} ${cliente.apellido}? Sus cuentas también quedarán inactivas y podrá reactivarlo después.`
    );
    if (!aceptado) return;

    this.servicio.eliminar(cliente.id_cliente!).subscribe({
      next: (r) => {
        this.notificacion.exito(r.mensaje);
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        if (!errorGlobal(err)) this.notificacion.error(mensajeDeError(err), 'No se pudo desactivar');
      },
    });
  }

  reactivar(cliente: Cliente): void {
    this.servicio.reactivar(cliente.id_cliente!).subscribe({
      next: (r) => {
        this.notificacion.exito(r.mensaje);
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        if (!errorGlobal(err)) this.notificacion.error(mensajeDeError(err), 'No se pudo reactivar');
      },
    });
  }
}

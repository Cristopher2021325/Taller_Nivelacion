import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Empleado } from '../../../core/models/empleado.model';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmacionService } from '../../../core/services/confirmacion.service';
import { EmpleadoService } from '../../../core/services/empleado.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { errorGlobal, mensajeDeError } from '../../../shared/utils/errores';

@Component({
  selector: 'app-empleado-lista',
  imports: [RouterLink, FormsModule],
  templateUrl: './empleado-lista.html',
})
export class EmpleadoLista implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly servicio = inject(EmpleadoService);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly notificacion = inject(NotificacionService);

  protected readonly empleados = signal<Empleado[]>([]);
  protected readonly cargando = signal(true);
  protected readonly filtro = signal('');

  protected readonly filtrados = computed(() => {
    const texto = this.filtro().trim().toLowerCase();
    if (!texto) return this.empleados();
    return this.empleados().filter((e) =>
      `${e.nombre} ${e.apellido} ${e.puesto} ${e.sucursal} ${e.telefono}`.toLowerCase().includes(texto)
    );
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.servicio.listar().subscribe({
      next: (datos) => {
        this.empleados.set(datos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  async eliminar(empleado: Empleado): Promise<void> {
    const aceptado = await this.confirmacion.confirmar(
      `¿Desea eliminar al empleado ${empleado.nombre} ${empleado.apellido}?`
    );
    if (!aceptado) return;

    this.servicio.eliminar(empleado.id_empleado!).subscribe({
      next: (r) => {
        this.notificacion.exito(r.mensaje);
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        if (!errorGlobal(err)) this.notificacion.error(mensajeDeError(err), 'No se pudo eliminar');
      },
    });
  }
}

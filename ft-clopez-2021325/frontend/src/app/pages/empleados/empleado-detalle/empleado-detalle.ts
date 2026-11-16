import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Empleado } from '../../../core/models/empleado.model';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmacionService } from '../../../core/services/confirmacion.service';
import { EmpleadoService } from '../../../core/services/empleado.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { errorGlobal, mensajeDeError } from '../../../shared/utils/errores';

@Component({
  selector: 'app-empleado-detalle',
  imports: [RouterLink],
  templateUrl: './empleado-detalle.html',
})
export class EmpleadoDetalle implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly servicio = inject(EmpleadoService);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly notificacion = inject(NotificacionService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  protected readonly empleado = signal<Empleado | null>(null);

  ngOnInit(): void {
    this.servicio.obtener(Number(this.id())).subscribe({
      next: (e) => this.empleado.set(e),
      error: (err: HttpErrorResponse) => {
        if (!errorGlobal(err)) this.notificacion.error(mensajeDeError(err));
        this.router.navigate(['/empleados']);
      },
    });
  }

  async eliminar(): Promise<void> {
    const e = this.empleado();
    if (!e) return;
    const aceptado = await this.confirmacion.confirmar(`¿Desea eliminar al empleado ${e.nombre} ${e.apellido}?`);
    if (!aceptado) return;

    this.servicio.eliminar(e.id_empleado!).subscribe({
      next: (r) => {
        this.notificacion.exito(r.mensaje);
        this.router.navigate(['/empleados']);
      },
      error: (err: HttpErrorResponse) => {
        if (!errorGlobal(err)) this.notificacion.error(mensajeDeError(err), 'No se pudo eliminar');
      },
    });
  }
}

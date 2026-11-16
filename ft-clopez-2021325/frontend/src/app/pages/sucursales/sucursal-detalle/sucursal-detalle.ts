import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Cuenta } from '../../../core/models/cuenta.model';
import { Empleado } from '../../../core/models/empleado.model';
import { Sucursal } from '../../../core/models/sucursal.model';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmacionService } from '../../../core/services/confirmacion.service';
import { CuentaService } from '../../../core/services/cuenta.service';
import { EmpleadoService } from '../../../core/services/empleado.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { SucursalService } from '../../../core/services/sucursal.service';
import { errorGlobal, mensajeDeError } from '../../../shared/utils/errores';

@Component({
  selector: 'app-sucursal-detalle',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './sucursal-detalle.html',
})
export class SucursalDetalle implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly servicio = inject(SucursalService);
  private readonly empleadoService = inject(EmpleadoService);
  private readonly cuentaService = inject(CuentaService);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly notificacion = inject(NotificacionService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  protected readonly sucursal = signal<Sucursal | null>(null);
  protected readonly empleados = signal<Empleado[]>([]);
  protected readonly cuentas = signal<Cuenta[]>([]);

  ngOnInit(): void {
    const id = Number(this.id());
    forkJoin({
      sucursal: this.servicio.obtener(id),
      empleados: this.empleadoService.listar(),
      cuentas: this.cuentaService.listar(),
    }).subscribe({
      next: (r) => {
        this.sucursal.set(r.sucursal);
        this.empleados.set(r.empleados.filter((e) => e.id_sucursal === id));
        this.cuentas.set(r.cuentas.filter((c) => c.id_sucursal === id));
      },
      error: (err: HttpErrorResponse) => {
        if (!errorGlobal(err)) this.notificacion.error(mensajeDeError(err));
        this.router.navigate(['/sucursales']);
      },
    });
  }

  async eliminar(): Promise<void> {
    const s = this.sucursal();
    if (!s) return;
    const aceptado = await this.confirmacion.confirmar(`¿Desea eliminar la sucursal "${s.nombre}"?`);
    if (!aceptado) return;

    this.servicio.eliminar(s.id_sucursal!).subscribe({
      next: (r) => {
        this.notificacion.exito(r.mensaje);
        this.router.navigate(['/sucursales']);
      },
      error: (err: HttpErrorResponse) => {
        if (!errorGlobal(err)) this.notificacion.error(mensajeDeError(err), 'No se pudo eliminar');
      },
    });
  }
}

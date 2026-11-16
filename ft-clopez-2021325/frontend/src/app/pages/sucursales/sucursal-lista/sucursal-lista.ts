import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Sucursal } from '../../../core/models/sucursal.model';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmacionService } from '../../../core/services/confirmacion.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { SucursalService } from '../../../core/services/sucursal.service';
import { errorGlobal, mensajeDeError } from '../../../shared/utils/errores';

@Component({
  selector: 'app-sucursal-lista',
  imports: [RouterLink, FormsModule],
  templateUrl: './sucursal-lista.html',
})
export class SucursalLista implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly servicio = inject(SucursalService);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly notificacion = inject(NotificacionService);

  protected readonly sucursales = signal<Sucursal[]>([]);
  protected readonly cargando = signal(true);
  protected readonly filtro = signal('');

  protected readonly filtradas = computed(() => {
    const texto = this.filtro().trim().toLowerCase();
    if (!texto) return this.sucursales();
    return this.sucursales().filter((s) =>
      `${s.nombre} ${s.direccion} ${s.telefono}`.toLowerCase().includes(texto)
    );
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.servicio.listar().subscribe({
      next: (datos) => {
        this.sucursales.set(datos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  async eliminar(sucursal: Sucursal): Promise<void> {
    const aceptado = await this.confirmacion.confirmar(`¿Desea eliminar la sucursal "${sucursal.nombre}"?`);
    if (!aceptado) return;

    this.servicio.eliminar(sucursal.id_sucursal!).subscribe({
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

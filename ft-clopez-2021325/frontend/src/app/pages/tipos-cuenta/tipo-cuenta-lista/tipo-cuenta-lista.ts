import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TipoCuenta } from '../../../core/models/tipo-cuenta.model';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmacionService } from '../../../core/services/confirmacion.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { TipoCuentaService } from '../../../core/services/tipo-cuenta.service';
import { errorGlobal, mensajeDeError } from '../../../shared/utils/errores';

@Component({
  selector: 'app-tipo-cuenta-lista',
  imports: [RouterLink, FormsModule],
  templateUrl: './tipo-cuenta-lista.html',
})
export class TipoCuentaLista implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly servicio = inject(TipoCuentaService);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly notificacion = inject(NotificacionService);

  protected readonly tipos = signal<TipoCuenta[]>([]);
  protected readonly cargando = signal(true);
  protected readonly filtro = signal('');

  protected readonly filtrados = computed(() => {
    const texto = this.filtro().trim().toLowerCase();
    if (!texto) return this.tipos();
    return this.tipos().filter((t) => `${t.nombre} ${t.descripcion}`.toLowerCase().includes(texto));
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.servicio.listar().subscribe({
      next: (datos) => {
        this.tipos.set(datos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  async eliminar(tipo: TipoCuenta): Promise<void> {
    const aceptado = await this.confirmacion.confirmar(`¿Desea eliminar el tipo de cuenta "${tipo.nombre}"?`);
    if (!aceptado) return;

    this.servicio.eliminar(tipo.id_tipo!).subscribe({
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

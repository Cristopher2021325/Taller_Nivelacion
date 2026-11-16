import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ErrorCampo as ErrorApiCampo } from '../../../core/models/api.model';
import { Sucursal } from '../../../core/models/sucursal.model';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { SucursalService } from '../../../core/services/sucursal.service';
import { ErrorCampo } from '../../../shared/components/error-campo/error-campo';
import { errorGlobal, mensajeDeError } from '../../../shared/utils/errores';
import { PATRON_TELEFONO, sinEspaciosVacios } from '../../../shared/validators/validadores';

@Component({
  selector: 'app-sucursal-form',
  imports: [ReactiveFormsModule, RouterLink, ErrorCampo],
  templateUrl: './sucursal-form.html',
})
export class SucursalForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(SucursalService);
  private readonly notificacion = inject(NotificacionService);
  private readonly router = inject(Router);

  readonly id = input<string>();

  protected readonly esEdicion = signal(false);
  protected readonly guardando = signal(false);
  protected readonly errorServidor = signal('');
  protected readonly erroresCampos = signal<ErrorApiCampo[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), sinEspaciosVacios]],
    direccion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200), sinEspaciosVacios]],
    telefono: ['', [Validators.required, Validators.pattern(PATRON_TELEFONO)]],
  });

  ngOnInit(): void {
    const id = Number(this.id());
    if (id) {
      this.esEdicion.set(true);
      this.servicio.obtener(id).subscribe({
        next: (sucursal) => this.form.patchValue(sucursal),
        error: (err: HttpErrorResponse) => {
          if (!errorGlobal(err)) this.notificacion.error(mensajeDeError(err));
          this.router.navigate(['/sucursales']);
        },
      });
    }
  }

  guardar(): void {
    this.errorServidor.set('');
    this.erroresCampos.set([]);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificacion.advertencia('Revise los campos marcados antes de guardar.', 'Formulario incompleto');
      return;
    }

    const datos: Sucursal = this.form.getRawValue();
    const peticion = this.esEdicion()
      ? this.servicio.actualizar(Number(this.id()), datos)
      : this.servicio.crear(datos);

    this.guardando.set(true);
    peticion.subscribe({
      next: (r) => {
        this.guardando.set(false);
        this.notificacion.exito(r.mensaje);
        this.router.navigate(['/sucursales']);
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        if (errorGlobal(err)) return;
        this.errorServidor.set(err.error?.mensaje ?? mensajeDeError(err));
        this.erroresCampos.set(err.error?.errores ?? []);
      },
    });
  }

  invalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && c.invalid && (c.touched || c.dirty);
  }
}

import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ErrorCampo as ErrorApiCampo } from '../../../core/models/api.model';
import { TipoCuenta } from '../../../core/models/tipo-cuenta.model';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { TipoCuentaService } from '../../../core/services/tipo-cuenta.service';
import { ErrorCampo } from '../../../shared/components/error-campo/error-campo';
import { errorGlobal, mensajeDeError } from '../../../shared/utils/errores';
import { sinEspaciosVacios } from '../../../shared/validators/validadores';

@Component({
  selector: 'app-tipo-cuenta-form',
  imports: [ReactiveFormsModule, RouterLink, ErrorCampo],
  templateUrl: './tipo-cuenta-form.html',
})
export class TipoCuentaForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(TipoCuentaService);
  private readonly notificacion = inject(NotificacionService);
  private readonly router = inject(Router);

  readonly id = input<string>();

  protected readonly esEdicion = signal(false);
  protected readonly guardando = signal(false);
  protected readonly errorServidor = signal('');
  protected readonly erroresCampos = signal<ErrorApiCampo[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), sinEspaciosVacios]],
    descripcion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255), sinEspaciosVacios]],
  });

  ngOnInit(): void {
    const id = Number(this.id());
    if (id) {
      this.esEdicion.set(true);
      this.servicio.obtener(id).subscribe({
        next: (tipo) => this.form.patchValue(tipo),
        error: (err: HttpErrorResponse) => {
          if (!errorGlobal(err)) this.notificacion.error(mensajeDeError(err));
          this.router.navigate(['/tipos-cuenta']);
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

    const datos: TipoCuenta = this.form.getRawValue();
    const peticion = this.esEdicion()
      ? this.servicio.actualizar(Number(this.id()), datos)
      : this.servicio.crear(datos);

    this.guardando.set(true);
    peticion.subscribe({
      next: (r) => {
        this.guardando.set(false);
        this.notificacion.exito(r.mensaje);
        this.router.navigate(['/tipos-cuenta']);
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

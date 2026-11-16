import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { ErrorCampo } from '../../shared/components/error-campo/error-campo';
import { errorGlobal, mensajeDeError } from '../../shared/utils/errores';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, ErrorCampo],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificacion = inject(NotificacionService);

  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly verPassword = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ingresar(): void {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: (respuesta) => {
        this.cargando.set(false);
        this.notificacion.exito(`Bienvenido(a), ${respuesta.usuario.nombre}.`, 'Inicio de sesión');
        this.router.navigate(['/inicio']);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        if (err.status === 401) {
          this.error.set('Usuario o contraseña incorrectos.');
        } else if (!errorGlobal(err)) {
          this.error.set(mensajeDeError(err));
        }
      },
    });
  }
}

import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ErrorCampo as ErrorApiCampo } from '../../../core/models/api.model';
import { Cliente } from '../../../core/models/cliente.model';
import { Cuenta } from '../../../core/models/cuenta.model';
import { Sucursal } from '../../../core/models/sucursal.model';
import { TipoCuenta } from '../../../core/models/tipo-cuenta.model';
import { ClienteService } from '../../../core/services/cliente.service';
import { CuentaService } from '../../../core/services/cuenta.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { SucursalService } from '../../../core/services/sucursal.service';
import { TipoCuentaService } from '../../../core/services/tipo-cuenta.service';
import { ErrorCampo } from '../../../shared/components/error-campo/error-campo';
import { errorGlobal, mensajeDeError } from '../../../shared/utils/errores';
import { fechaHoy, fechaNoFutura, PATRON_NUMERO_CUENTA } from '../../../shared/validators/validadores';

@Component({
  selector: 'app-cuenta-form',
  imports: [ReactiveFormsModule, RouterLink, ErrorCampo],
  templateUrl: './cuenta-form.html',
})
export class CuentaForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(CuentaService);
  private readonly clienteService = inject(ClienteService);
  private readonly tipoService = inject(TipoCuentaService);
  private readonly sucursalService = inject(SucursalService);
  private readonly notificacion = inject(NotificacionService);
  private readonly router = inject(Router);

  readonly id = input<string>();

  protected readonly hoy = fechaHoy();
  protected readonly esEdicion = signal(false);
  protected readonly guardando = signal(false);
  protected readonly errorServidor = signal('');
  protected readonly erroresCampos = signal<ErrorApiCampo[]>([]);

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly tipos = signal<TipoCuenta[]>([]);
  protected readonly sucursales = signal<Sucursal[]>([]);

  protected readonly form = this.fb.group({
    numero_cuenta: ['', [Validators.required, Validators.pattern(PATRON_NUMERO_CUENTA)]],
    saldo: [null as number | null, [Validators.required, Validators.min(0), Validators.max(999999999999)]],
    fecha_apertura: [fechaHoy(), [Validators.required, fechaNoFutura]],
    id_tipo: [null as number | null, Validators.required],
    id_cliente: [null as number | null, Validators.required],
    id_sucursal: [null as number | null, Validators.required],
  });

  ngOnInit(): void {
    forkJoin({
      clientes: this.clienteService.listar(),
      tipos: this.tipoService.listar(),
      sucursales: this.sucursalService.listar(),
    }).subscribe((r) => {
      this.clientes.set(r.clientes);
      this.tipos.set(r.tipos);
      this.sucursales.set(r.sucursales);
    });

    const id = Number(this.id());
    if (id) {
      this.esEdicion.set(true);
      this.servicio.obtener(id).subscribe({
        next: (cuenta) => this.form.patchValue(cuenta),
        error: (err: HttpErrorResponse) => {
          if (!errorGlobal(err)) this.notificacion.error(mensajeDeError(err));
          this.router.navigate(['/cuentas']);
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

    const datos = this.form.getRawValue() as unknown as Cuenta;
    const peticion = this.esEdicion()
      ? this.servicio.actualizar(Number(this.id()), datos)
      : this.servicio.crear(datos);

    this.guardando.set(true);
    peticion.subscribe({
      next: (r) => {
        this.guardando.set(false);
        this.notificacion.exito(r.mensaje);
        this.router.navigate(['/cuentas']);
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

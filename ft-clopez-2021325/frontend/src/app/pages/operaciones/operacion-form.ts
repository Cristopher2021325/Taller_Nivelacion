import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, input, OnInit, signal, untracked } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Cuenta } from '../../core/models/cuenta.model';
import { ResultadoOperacion, TipoMovimiento } from '../../core/models/movimiento.model';
import { CuentaService } from '../../core/services/cuenta.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { OperacionService } from '../../core/services/operacion.service';
import { ErrorCampo } from '../../shared/components/error-campo/error-campo';
import { errorGlobal, mensajeDeError } from '../../shared/utils/errores';

// regla 7: no se puede transferir hacia la misma cuenta
const distintasCuentas = (g: AbstractControl): ValidationErrors | null => {
  const origen = g.get('id_cuenta')?.value;
  const destino = g.get('id_cuenta_destino')?.value;
  return origen && destino && origen === destino ? { mismaCuenta: true } : null;
};

@Component({
  selector: 'app-operacion-form',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, ErrorCampo],
  templateUrl: './operacion-form.html',
})
export class OperacionForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cuentaService = inject(CuentaService);
  private readonly operaciones = inject(OperacionService);
  private readonly notificacion = inject(NotificacionService);

  // viene de la ruta /operaciones/:tipo
  readonly tipo = input<string>('deposito');

  protected readonly modo = computed<TipoMovimiento>(() => {
    const t = this.tipo();
    return t === 'retiro' || t === 'transferencia' ? t : 'deposito';
  });

  protected readonly tabs = [
    { tipo: 'deposito', texto: 'Depósito', icono: 'bi-box-arrow-in-down' },
    { tipo: 'retiro', texto: 'Retiro', icono: 'bi-box-arrow-up' },
    { tipo: 'transferencia', texto: 'Transferencia', icono: 'bi-arrow-left-right' },
  ];

  protected readonly cuentas = signal<Cuenta[]>([]);
  protected readonly guardando = signal(false);
  protected readonly errorServidor = signal('');
  protected readonly resultado = signal<ResultadoOperacion | null>(null);

  protected readonly form = this.fb.group(
    {
      id_cuenta: [null as number | null, Validators.required],
      id_cuenta_destino: [null as number | null],
      monto: [
        null as number | null,
        [Validators.required, Validators.min(0.01), Validators.max(999999999999), Validators.pattern(/^\d+(\.\d{1,2})?$/)],
      ],
      descripcion: ['', Validators.maxLength(150)],
    },
    { validators: distintasCuentas }
  );

  constructor() {
    // al cambiar de pestaña se reinicia el formulario
    effect(() => {
      const modo = this.modo();
      untracked(() => {
        const destino = this.form.controls.id_cuenta_destino;
        destino.setValidators(modo === 'transferencia' ? [Validators.required] : []);
        this.form.reset({ id_cuenta: null, id_cuenta_destino: null, monto: null, descripcion: '' });
        this.errorServidor.set('');
        this.resultado.set(null);
      });
    });
  }

  ngOnInit(): void {
    this.cargarCuentas();
  }

  private cargarCuentas(): void {
    this.cuentaService.listar().subscribe((datos) => this.cuentas.set(datos));
  }

  protected etiqueta(c: Cuenta): string {
    const inactiva = c.estado === 'inactiva' ? ' (inactiva)' : '';
    return `${c.numero_cuenta} · ${c.cliente} · Q ${Number(c.saldo).toFixed(2)}${inactiva}`;
  }

  protected saldoDe(id: number | null | undefined): number | null {
    const cuenta = this.cuentas().find((c) => c.id_cuenta === id);
    return cuenta ? Number(cuenta.saldo) : null;
  }

  protected invalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  guardar(): void {
    this.errorServidor.set('');
    this.resultado.set(null);
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    const descripcion = v.descripcion?.trim() || undefined;
    const modo = this.modo();

    const peticion =
      modo === 'transferencia'
        ? this.operaciones.transferir({
            id_cuenta_origen: v.id_cuenta!,
            id_cuenta_destino: v.id_cuenta_destino!,
            monto: Number(v.monto),
            descripcion,
          })
        : modo === 'retiro'
          ? this.operaciones.retirar({ id_cuenta: v.id_cuenta!, monto: Number(v.monto), descripcion })
          : this.operaciones.depositar({ id_cuenta: v.id_cuenta!, monto: Number(v.monto), descripcion });

    this.guardando.set(true);
    peticion.subscribe({
      next: (r) => {
        this.guardando.set(false);
        this.notificacion.exito(r.mensaje);
        this.resultado.set(r.data);
        this.form.reset({ id_cuenta: null, id_cuenta_destino: null, monto: null, descripcion: '' });
        this.cargarCuentas();
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        if (!errorGlobal(err)) this.errorServidor.set(mensajeDeError(err));
      },
    });
  }
}

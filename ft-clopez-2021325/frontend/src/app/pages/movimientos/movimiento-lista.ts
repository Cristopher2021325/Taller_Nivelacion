import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Movimiento } from '../../core/models/movimiento.model';
import { OperacionService } from '../../core/services/operacion.service';

// fecha local (yyyy-mm-dd) para comparar con los filtros
const fechaLocal = (iso: string): string => new Date(iso).toLocaleDateString('en-CA');

@Component({
  selector: 'app-movimiento-lista',
  imports: [FormsModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './movimiento-lista.html',
})
export class MovimientoLista implements OnInit {
  private readonly servicio = inject(OperacionService);

  // /movimientos?cuenta=ID muestra solo los movimientos de esa cuenta
  readonly cuenta = input<string>();

  protected readonly movimientos = signal<Movimiento[]>([]);
  protected readonly cargando = signal(true);
  protected readonly tipo = signal('');
  protected readonly desde = signal('');
  protected readonly hasta = signal('');

  protected readonly filtrados = computed(() =>
    this.movimientos().filter((m) => {
      const dia = fechaLocal(m.fecha);
      return (
        (!this.tipo() || m.tipo === this.tipo()) &&
        (!this.desde() || dia >= this.desde()) &&
        (!this.hasta() || dia <= this.hasta())
      );
    })
  );

  protected readonly total = computed(() => this.filtrados().reduce((s, m) => s + Number(m.monto), 0));

  ngOnInit(): void {
    const id = Number(this.cuenta());
    const peticion = id > 0 ? this.servicio.movimientosDeCuenta(id) : this.servicio.movimientos();
    peticion.subscribe({
      next: (datos) => {
        this.movimientos.set(datos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  protected limpiar(): void {
    this.tipo.set('');
    this.desde.set('');
    this.hasta.set('');
  }

  protected claseTipo(tipo: string): string {
    return tipo === 'deposito' ? 'text-bg-success' : tipo === 'retiro' ? 'text-bg-danger' : 'text-bg-primary';
  }
}

import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ResumenOperaciones } from '../../core/models/movimiento.model';
import { OperacionService } from '../../core/services/operacion.service';

@Component({
  selector: 'app-reporte',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './reporte.html',
})
export class Reporte implements OnInit {
  private readonly servicio = inject(OperacionService);

  protected readonly resumen = signal<ResumenOperaciones | null>(null);
  protected readonly cargando = signal(true);

  ngOnInit(): void {
    this.servicio.resumen().subscribe({
      next: (r) => {
        this.resumen.set(r);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  protected imprimir(): void {
    window.print();
  }
}

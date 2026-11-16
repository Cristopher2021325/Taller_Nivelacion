import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Cuenta } from '../../core/models/cuenta.model';
import { AuthService } from '../../core/services/auth.service';
import { ClienteService } from '../../core/services/cliente.service';
import { CuentaService } from '../../core/services/cuenta.service';
import { EmpleadoService } from '../../core/services/empleado.service';
import { SucursalService } from '../../core/services/sucursal.service';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly clienteService = inject(ClienteService);
  private readonly cuentaService = inject(CuentaService);
  private readonly sucursalService = inject(SucursalService);
  private readonly empleadoService = inject(EmpleadoService);

  protected readonly cargando = signal(true);
  protected readonly totalClientes = signal(0);
  protected readonly totalSucursales = signal(0);
  protected readonly totalEmpleados = signal(0);
  protected readonly cuentas = signal<Cuenta[]>([]);

  protected readonly saldoTotal = computed(() =>
    this.cuentas().reduce((suma, c) => suma + Number(c.saldo), 0)
  );

  protected readonly recientes = computed(() =>
    [...this.cuentas()]
      .sort((a, b) => b.fecha_apertura.localeCompare(a.fecha_apertura))
      .slice(0, 5)
  );

  protected readonly accesos = [
    { ruta: '/clientes', titulo: 'Clientes', texto: 'Registro de clientes del banco', icono: 'bi-people' },
    { ruta: '/cuentas', titulo: 'Cuentas', texto: 'Cuentas, saldos y aperturas', icono: 'bi-credit-card-2-front' },
    { ruta: '/tipos-cuenta', titulo: 'Tipos de cuenta', texto: 'Monetaria, ahorro, plazo fijo...', icono: 'bi-tags' },
    { ruta: '/sucursales', titulo: 'Sucursales', texto: 'Agencias del banco', icono: 'bi-bank' },
    { ruta: '/empleados', titulo: 'Empleados', texto: 'Personal por sucursal', icono: 'bi-person-badge' },
  ];

  ngOnInit(): void {
    forkJoin({
      clientes: this.clienteService.listar(),
      cuentas: this.cuentaService.listar(),
      sucursales: this.sucursalService.listar(),
      empleados: this.empleadoService.listar(),
    }).subscribe({
      next: (r) => {
        this.totalClientes.set(r.clientes.length);
        this.cuentas.set(r.cuentas);
        this.totalSucursales.set(r.sucursales.length);
        this.totalEmpleados.set(r.empleados.length);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}

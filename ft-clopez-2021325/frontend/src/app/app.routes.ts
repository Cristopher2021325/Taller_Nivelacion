import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { invitadoGuard } from './core/guards/invitado.guard';
import { Layout } from './layout/layout';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [invitadoGuard],
    title: 'Iniciar sesión',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      {
        path: 'inicio',
        title: 'Inicio',
        loadComponent: () => import('./pages/inicio/inicio').then((m) => m.Inicio),
      },

      // operaciones bancarias, movimientos y reportes
      { path: 'operaciones', pathMatch: 'full', redirectTo: 'operaciones/deposito' },
      { path: 'operaciones/:tipo', title: 'Operaciones', canActivate: [adminGuard], loadComponent: () => import('./pages/operaciones/operacion-form').then((m) => m.OperacionForm) },
      { path: 'movimientos', title: 'Movimientos', loadComponent: () => import('./pages/movimientos/movimiento-lista').then((m) => m.MovimientoLista) },
      { path: 'reportes', title: 'Reportes', loadComponent: () => import('./pages/reportes/reporte').then((m) => m.Reporte) },

      // clientes
      { path: 'clientes', title: 'Clientes', loadComponent: () => import('./pages/clientes/cliente-lista/cliente-lista').then((m) => m.ClienteLista) },
      { path: 'clientes/nuevo', title: 'Nuevo cliente', canActivate: [adminGuard], loadComponent: () => import('./pages/clientes/cliente-form/cliente-form').then((m) => m.ClienteForm) },
      { path: 'clientes/:id', title: 'Detalle de cliente', loadComponent: () => import('./pages/clientes/cliente-detalle/cliente-detalle').then((m) => m.ClienteDetalle) },
      { path: 'clientes/:id/editar', title: 'Editar cliente', canActivate: [adminGuard], loadComponent: () => import('./pages/clientes/cliente-form/cliente-form').then((m) => m.ClienteForm) },

      // cuentas
      { path: 'cuentas', title: 'Cuentas', loadComponent: () => import('./pages/cuentas/cuenta-lista/cuenta-lista').then((m) => m.CuentaLista) },
      { path: 'cuentas/nuevo', title: 'Nueva cuenta', canActivate: [adminGuard], loadComponent: () => import('./pages/cuentas/cuenta-form/cuenta-form').then((m) => m.CuentaForm) },
      { path: 'cuentas/:id', title: 'Detalle de cuenta', loadComponent: () => import('./pages/cuentas/cuenta-detalle/cuenta-detalle').then((m) => m.CuentaDetalle) },
      { path: 'cuentas/:id/editar', title: 'Editar cuenta', canActivate: [adminGuard], loadComponent: () => import('./pages/cuentas/cuenta-form/cuenta-form').then((m) => m.CuentaForm) },

      // tipos de cuenta
      { path: 'tipos-cuenta', title: 'Tipos de cuenta', loadComponent: () => import('./pages/tipos-cuenta/tipo-cuenta-lista/tipo-cuenta-lista').then((m) => m.TipoCuentaLista) },
      { path: 'tipos-cuenta/nuevo', title: 'Nuevo tipo de cuenta', canActivate: [adminGuard], loadComponent: () => import('./pages/tipos-cuenta/tipo-cuenta-form/tipo-cuenta-form').then((m) => m.TipoCuentaForm) },
      { path: 'tipos-cuenta/:id', title: 'Detalle de tipo de cuenta', loadComponent: () => import('./pages/tipos-cuenta/tipo-cuenta-detalle/tipo-cuenta-detalle').then((m) => m.TipoCuentaDetalle) },
      { path: 'tipos-cuenta/:id/editar', title: 'Editar tipo de cuenta', canActivate: [adminGuard], loadComponent: () => import('./pages/tipos-cuenta/tipo-cuenta-form/tipo-cuenta-form').then((m) => m.TipoCuentaForm) },

      // sucursales
      { path: 'sucursales', title: 'Sucursales', loadComponent: () => import('./pages/sucursales/sucursal-lista/sucursal-lista').then((m) => m.SucursalLista) },
      { path: 'sucursales/nuevo', title: 'Nueva sucursal', canActivate: [adminGuard], loadComponent: () => import('./pages/sucursales/sucursal-form/sucursal-form').then((m) => m.SucursalForm) },
      { path: 'sucursales/:id', title: 'Detalle de sucursal', loadComponent: () => import('./pages/sucursales/sucursal-detalle/sucursal-detalle').then((m) => m.SucursalDetalle) },
      { path: 'sucursales/:id/editar', title: 'Editar sucursal', canActivate: [adminGuard], loadComponent: () => import('./pages/sucursales/sucursal-form/sucursal-form').then((m) => m.SucursalForm) },

      // empleados
      { path: 'empleados', title: 'Empleados', loadComponent: () => import('./pages/empleados/empleado-lista/empleado-lista').then((m) => m.EmpleadoLista) },
      { path: 'empleados/nuevo', title: 'Nuevo empleado', canActivate: [adminGuard], loadComponent: () => import('./pages/empleados/empleado-form/empleado-form').then((m) => m.EmpleadoForm) },
      { path: 'empleados/:id', title: 'Detalle de empleado', loadComponent: () => import('./pages/empleados/empleado-detalle/empleado-detalle').then((m) => m.EmpleadoDetalle) },
      { path: 'empleados/:id/editar', title: 'Editar empleado', canActivate: [adminGuard], loadComponent: () => import('./pages/empleados/empleado-form/empleado-form').then((m) => m.EmpleadoForm) },
    ],
  },
  { path: '**', redirectTo: 'inicio' },
];

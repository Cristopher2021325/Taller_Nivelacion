import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Confirmacion } from './shared/components/confirmacion/confirmacion';
import { Notificaciones } from './shared/components/notificaciones/notificaciones';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Notificaciones, Confirmacion],
  template: `
    <router-outlet />
    <app-notificaciones />
    <app-confirmacion />
  `,
})
export class App {}

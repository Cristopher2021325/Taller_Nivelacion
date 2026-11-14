import { Injectable } from '@angular/core';
import { TipoCuenta } from '../models/tipo-cuenta.model';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class TipoCuentaService extends CrudService<TipoCuenta> {
  constructor() {
    super('tipos-cuenta');
  }
}

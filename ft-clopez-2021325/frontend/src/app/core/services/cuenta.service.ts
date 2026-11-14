import { Injectable } from '@angular/core';
import { Cuenta } from '../models/cuenta.model';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class CuentaService extends CrudService<Cuenta> {
  constructor() {
    super('cuentas');
  }
}

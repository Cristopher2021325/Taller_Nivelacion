import { Injectable } from '@angular/core';
import { Sucursal } from '../models/sucursal.model';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class SucursalService extends CrudService<Sucursal> {
  constructor() {
    super('sucursales');
  }
}

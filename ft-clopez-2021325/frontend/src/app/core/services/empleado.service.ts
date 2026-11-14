import { Injectable } from '@angular/core';
import { Empleado } from '../models/empleado.model';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class EmpleadoService extends CrudService<Empleado> {
  constructor() {
    super('empleados');
  }
}

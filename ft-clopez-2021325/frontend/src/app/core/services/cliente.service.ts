import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RespuestaApi } from '../models/api.model';
import { Cliente } from '../models/cliente.model';
import { Cuenta } from '../models/cuenta.model';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class ClienteService extends CrudService<Cliente> {
  constructor() {
    super('clientes');
  }

  reactivar(id: number): Observable<RespuestaApi<Cliente>> {
    return this.http.patch<RespuestaApi<Cliente>>(`${this.url}/${id}/reactivar`, {});
  }

  listarCuentas(idCliente: number): Observable<Cuenta[]> {
    return this.http.get<Cuenta[]>(`${this.url}/${idCliente}/cuentas`);
  }
}

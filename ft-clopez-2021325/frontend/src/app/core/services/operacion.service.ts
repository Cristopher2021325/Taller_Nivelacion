import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RespuestaApi } from '../models/api.model';
import { Movimiento, ResultadoOperacion, ResumenOperaciones } from '../models/movimiento.model';

export interface DatosOperacion {
  id_cuenta: number;
  monto: number;
  descripcion?: string;
}

export interface DatosTransferencia {
  id_cuenta_origen: number;
  id_cuenta_destino: number;
  monto: number;
  descripcion?: string;
}

@Injectable({ providedIn: 'root' })
export class OperacionService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;

  depositar(datos: DatosOperacion): Observable<RespuestaApi<ResultadoOperacion>> {
    return this.http.post<RespuestaApi<ResultadoOperacion>>(`${this.url}/depositos`, datos);
  }

  retirar(datos: DatosOperacion): Observable<RespuestaApi<ResultadoOperacion>> {
    return this.http.post<RespuestaApi<ResultadoOperacion>>(`${this.url}/retiros`, datos);
  }

  transferir(datos: DatosTransferencia): Observable<RespuestaApi<ResultadoOperacion>> {
    return this.http.post<RespuestaApi<ResultadoOperacion>>(`${this.url}/transferencias`, datos);
  }

  movimientos(): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(`${this.url}/movimientos`);
  }

  movimientosDeCuenta(idCuenta: number): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(`${this.url}/movimientos/cuenta/${idCuenta}`);
  }

  resumen(): Observable<ResumenOperaciones> {
    return this.http.get<ResumenOperaciones>(`${this.url}/reportes/resumen`);
  }
}

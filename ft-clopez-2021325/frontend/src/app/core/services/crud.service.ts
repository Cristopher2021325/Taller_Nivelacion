import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MensajeApi, RespuestaApi } from '../models/api.model';

// servicio base con las operaciones get, get por id, post, put y delete
export abstract class CrudService<T> {
  protected readonly http = inject(HttpClient);
  protected readonly url: string;

  protected constructor(recurso: string) {
    this.url = `${environment.apiUrl}/${recurso}`;
  }

  listar(): Observable<T[]> {
    return this.http.get<T[]>(this.url);
  }

  obtener(id: number): Observable<T> {
    return this.http.get<T>(`${this.url}/${id}`);
  }

  crear(datos: T): Observable<RespuestaApi<T>> {
    return this.http.post<RespuestaApi<T>>(this.url, datos);
  }

  actualizar(id: number, datos: T): Observable<RespuestaApi<T>> {
    return this.http.put<RespuestaApi<T>>(`${this.url}/${id}`, datos);
  }

  eliminar(id: number): Observable<MensajeApi> {
    return this.http.delete<MensajeApi>(`${this.url}/${id}`);
  }
}

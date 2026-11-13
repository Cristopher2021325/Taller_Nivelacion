export class HttpError extends Error {
  public readonly status: number;
  public readonly codigo: string;

  constructor(status: number, mensaje: string, codigo = 'ERROR') {
    super(mensaje);
    this.status = status;
    this.codigo = codigo;
  }
}

export const noEncontrado = (entidad: string): HttpError =>
  new HttpError(404, `${entidad} no encontrado(a)`, 'NO_ENCONTRADO');

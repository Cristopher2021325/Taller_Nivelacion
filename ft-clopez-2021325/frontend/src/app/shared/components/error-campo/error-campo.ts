import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

// muestra el mensaje de validacion de un campo del formulario
@Component({
  selector: 'app-error-campo',
  template: `
    @if (control().invalid && (control().touched || control().dirty)) {
      <div class="invalid-feedback d-block">
        <i class="bi bi-exclamation-circle me-1"></i>{{ mensaje() }}
      </div>
    }
  `,
})
export class ErrorCampo {
  readonly control = input.required<AbstractControl>();
  readonly etiqueta = input<string>('El campo');
  readonly mensajePatron = input<string>('El formato no es válido');

  mensaje(): string {
    const e = this.control().errors;
    if (!e) return '';
    if (e['required']) return `${this.etiqueta()} es obligatorio.`;
    if (e['espacios']) return `${this.etiqueta()} no puede contener solo espacios.`;
    if (e['minlength']) return `${this.etiqueta()} debe tener al menos ${e['minlength'].requiredLength} caracteres.`;
    if (e['maxlength']) return `${this.etiqueta()} no puede superar ${e['maxlength'].requiredLength} caracteres.`;
    if (e['email']) return 'Ingrese un correo electrónico válido.';
    if (e['pattern']) return this.mensajePatron();
    if (e['min']) return `${this.etiqueta()} debe ser mayor o igual a ${e['min'].min}.`;
    if (e['max']) return `${this.etiqueta()} debe ser menor o igual a ${e['max'].max}.`;
    if (e['fechaFutura']) return 'La fecha no puede ser posterior a la fecha actual.';
    return `${this.etiqueta()} no es válido.`;
  }
}

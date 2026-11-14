import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const PATRON_LETRAS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
export const PATRON_TELEFONO = /^[0-9]{8}$/;
export const PATRON_DPI = /^[0-9]{13}$/;
export const PATRON_NUMERO_CUENTA = /^[0-9]{4}-[0-9]{4}-[0-9]{2}$/;

// no permite valores formados solo por espacios
export const sinEspaciosVacios: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor = control.value;
  if (typeof valor === 'string' && valor.length > 0 && valor.trim().length === 0) {
    return { espacios: true };
  }
  return null;
};

// la fecha no puede ser mayor a la fecha actual
export const fechaNoFutura: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) return null;
  return control.value > fechaHoy() ? { fechaFutura: true } : null;
};

// fecha local en formato yyyy-mm-dd
export const fechaHoy = (): string => {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
};

/**
 * Validaciones del formulario de acceso (F-01 §5, RN-09 y CA-11).
 *
 * Son funciones puras: no usan Firebase ni React, así que se prueban con
 * Jest (tests/acceso/validacion.test.ts). El formato del correo NO se revisa
 * aquí: lo revisa Firebase (F-01 §5, A-2).
 */
import MENSAJES from '../mensajes';

/** Mínimo de caracteres de la contraseña (CA-11; también es el mínimo de Firebase). */
export const LONGITUD_MINIMA_CONTRASENA = 6;

/**
 * Recibe los valores de los campos de un formulario.
 * Devuelve `true` si ninguno está vacío. Un campo con solo espacios cuenta
 * como vacío (RN-09: el botón no responde hasta llenar todos).
 */
export function camposLlenos(valores: readonly string[]): boolean {
  return valores.every((valor) => valor.trim().length > 0);
}

/**
 * Recibe la contraseña que escribió el adoptante al registrarse.
 * Devuelve `null` si tiene al menos 6 caracteres, o el mensaje de CA-11.
 * Se revisa en el teléfono, antes de llamar a Firebase.
 */
export function validarContrasena(contrasena: string): string | null {
  return contrasena.length < LONGITUD_MINIMA_CONTRASENA ? MENSAJES.CONTRASENA_CORTA : null;
}

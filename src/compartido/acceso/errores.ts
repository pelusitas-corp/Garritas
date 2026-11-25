/**
 * Traduce los códigos de error de Firebase a los mensajes de la spec
 * (F-01 §6, RN-10, RN-11 y RN-12; decisiones del plan aprobado, P1).
 *
 * Analogía: Firebase contesta en "su idioma" (`auth/invalid-credential`);
 * este archivo es el diccionario que lo pasa al mensaje que ve la persona.
 *
 * Funciones puras: se prueban con Jest (tests/acceso/errores.test.ts).
 */
import MENSAJES from '../mensajes';

/**
 * Código propio de Garritas (no es de Firebase): la cuenta se creó en
 * Authentication, pero no se pudo escribir `usuarios/{uid}` (RN-11).
 */
export const ERROR_USUARIO_NO_GUARDADO = 'garritas/usuario-no-guardado';

/** Errores al crear la cuenta. Cualquier otro código → ERROR_CONEXION (P1). */
const ERRORES_REGISTRO: Partial<Record<string, string>> = {
  'auth/email-already-in-use': MENSAJES.CORREO_YA_REGISTRADO, // CA-04
  'auth/invalid-email': MENSAJES.CORREO_INVALIDO, // CA-13
  'auth/weak-password': MENSAJES.CONTRASENA_CORTA, // CA-11
  'auth/network-request-failed': MENSAJES.ERROR_CONEXION, // CA-12
  'auth/too-many-requests': MENSAJES.ERROR_CONEXION, // P1
  [ERROR_USUARIO_NO_GUARDADO]: MENSAJES.ERROR_CONEXION, // RN-11
};

/** Errores al iniciar sesión. Cualquier otro código → CREDENCIALES_INVALIDAS (P1). */
const ERRORES_ACCESO: Partial<Record<string, string>> = {
  'auth/invalid-credential': MENSAJES.CREDENCIALES_INVALIDAS, // CA-06
  'auth/user-not-found': MENSAJES.CREDENCIALES_INVALIDAS, // CA-06
  'auth/wrong-password': MENSAJES.CREDENCIALES_INVALIDAS, // CA-06
  'auth/invalid-email': MENSAJES.CREDENCIALES_INVALIDAS, // RN-10
  'auth/too-many-requests': MENSAJES.CREDENCIALES_INVALIDAS, // RN-12
  'auth/user-disabled': MENSAJES.CREDENCIALES_INVALIDAS, // P1
  'auth/network-request-failed': MENSAJES.ERROR_CONEXION, // CA-12
};

/** Recibe el código de error al crear la cuenta. Devuelve el mensaje que se muestra. */
export function mensajeErrorRegistro(codigo: string): string {
  return ERRORES_REGISTRO[codigo] ?? MENSAJES.ERROR_CONEXION;
}

/** Recibe el código de error al iniciar sesión. Devuelve el mensaje que se muestra. */
export function mensajeErrorAcceso(codigo: string): string {
  return ERRORES_ACCESO[codigo] ?? MENSAJES.CREDENCIALES_INVALIDAS;
}

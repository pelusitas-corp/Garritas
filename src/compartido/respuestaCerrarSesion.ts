/**
 * Respuesta al modal "¿Quieres cerrar sesión?" (spec F-13 §4.1 punto 4,
 * AF-17; 02 v1.4 N-3 y CA-14; decisión del equipo, no está en el SRS).
 *
 * Función pura (sin React ni Firebase): recibe qué eligió la persona y qué
 * hacer, para poder probarla con Jest. La usa `ConfirmarCerrarSesion`.
 */

/** Lo que puede elegir la persona. "Atrás" de Android y tocar fuera cuentan como `cancelar`. */
export type RespuestaCerrarSesion = 'confirmar' | 'cancelar';

/** Qué hacer al responder: cerrar el modal y, si confirma, cerrar la sesión. */
export interface AccionesCerrarSesion {
  ocultar: () => void;
  cerrarSesion: () => void;
}

/**
 * Recibe la respuesta y las acciones. Siempre cierra el modal; solo con
 * `confirmar` cierra también la sesión (las guardas llevan después a `/`).
 * No devuelve nada.
 */
export function responderCerrarSesion(
  respuesta: RespuestaCerrarSesion,
  { ocultar, cerrarSesion }: AccionesCerrarSesion,
): void {
  ocultar();
  if (respuesta === 'confirmar') {
    cerrarSesion();
  }
}
